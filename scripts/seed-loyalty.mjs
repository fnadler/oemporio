#!/usr/bin/env node
/**
 * Semente do programa de fidelidade — só para STAGING (nunca prod): cria os
 * 3 programas do protótipo original (Cartão Cerveja, Clube do Vinho, Café
 * da Manhã) e atribui alguns clientes reais já migrados (Fase 3) com
 * histórico de selos, pra Fidelidade não aparecer vazia nos testes manuais.
 *
 * Os campos de autoria (loyalty_stamps.recorded_by/recorded_at,
 * loyalty_cartelas.redeemed_by/redeemed_at) são carimbados por trigger a
 * partir de auth.uid() — que não existe numa conexão direta via
 * service_role/pg. Por isso este script desliga essas 2 triggers só
 * durante a inserção (dentro de uma transação, sempre religando no final,
 * mesmo em erro) para poder gravar datas/autoria históricas realistas.
 *
 * Uso: node scripts/seed-loyalty.mjs             # dry-run
 *      node scripts/seed-loyalty.mjs --apply      # aplica em staging
 */
import { readFileSync } from 'node:fs'
import pg from 'pg'

const apply = process.argv.includes('--apply')

function parseEnvFile(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim()
  }
  return out
}
const env = parseEnvFile('.env.staging')
const client = new pg.Client({ connectionString: env.SUPABASE_STAGING_DB_URL })
await client.connect()

console.log(`Modo: ${apply ? 'APLICAR' : 'DRY-RUN'} · destino: staging\n`)

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function isoDate(d) {
  return d.toISOString().slice(0, 10)
}

await client.query('begin')
try {
  // ===== clientes reais a usar (pulando entradas óbvias de teste, 1 por pessoa) =====
  const { rows: candidates } = await client.query(
    `select id, first_name, last_name from customers
     where last_name not ilike '%teste%'
     order by created_at desc limit 20`
  )
  const seenNames = new Set()
  const customers = []
  for (const c of candidates) {
    const key = `${c.first_name.toLowerCase()}|${c.last_name.toLowerCase()}`
    if (seenNames.has(key)) continue
    seenNames.add(key)
    customers.push(c)
    if (customers.length === 7) break
  }
  if (customers.length < 7) throw new Error(`esperava pelo menos 7 clientes distintos, achei ${customers.length}`)
  const [cFiel, cQuaseLa, cRedeemed, cA, cB, cVinho, cCafe] = customers
  console.log('Clientes escolhidos:', customers.map((c) => `${c.first_name} ${c.last_name}`).join(', '))

  // ===== 1. Programas (todos criados ATIVOS — Café da Manhã é desativado só no final,
  // depois de já ter cliente/selos, pra não esbarrar no trigger "só atribui a programa ativo") =====
  const { rows: [cerveja] } = await client.query(
    `insert into loyalty_programs (name, points_required, is_active, activated_at)
     values ('Cartão Cerveja', 5, true, $1) returning id`,
    [isoDate(daysAgo(120))]
  )
  const { rows: [vinho] } = await client.query(
    `insert into loyalty_programs (name, points_required, is_active, activated_at)
     values ('Clube do Vinho', 8, true, $1) returning id`,
    [isoDate(daysAgo(80))]
  )
  const { rows: [cafe] } = await client.query(
    `insert into loyalty_programs (name, points_required, is_active, activated_at)
     values ('Café da Manhã', 10, true, $1) returning id`,
    [isoDate(daysAgo(150))]
  )
  console.log('Programas criados: Cartão Cerveja, Clube do Vinho, Café da Manhã')

  // ===== 2. Itens de consumo =====
  const itemIds = {}
  for (const [label, programId] of [['56', cerveja.id], ['33', cerveja.id], ['28', cerveja.id]]) {
    const { rows: [i] } = await client.query(
      `insert into loyalty_program_items (program_id, label) values ($1, $2) returning id`,
      [programId, label]
    )
    itemIds[`cerveja_${label}`] = i.id
  }
  for (const label of ['Tinto', 'Branco']) {
    const { rows: [i] } = await client.query(
      `insert into loyalty_program_items (program_id, label) values ($1, $2) returning id`,
      [vinho.id, label]
    )
    itemIds[`vinho_${label}`] = i.id
  }
  const { rows: [cafeItem] } = await client.query(
    `insert into loyalty_program_items (program_id, label) values ($1, 'Café') returning id`,
    [cafe.id]
  )
  itemIds.cafe = cafeItem.id
  console.log('Itens de consumo criados.')

  // ===== 3. Cartões (atribuição) =====
  async function assignCard(customerId, programId) {
    const { rows: [card] } = await client.query(
      `insert into loyalty_cards (customer_id, program_id) values ($1, $2) returning id`,
      [customerId, programId]
    )
    return card.id
  }
  const cardFiel = await assignCard(cFiel.id, cerveja.id)
  const cardQuaseLa = await assignCard(cQuaseLa.id, cerveja.id)
  const cardRedeemed = await assignCard(cRedeemed.id, cerveja.id)
  const cardA = await assignCard(cA.id, cerveja.id)
  const cardB = await assignCard(cB.id, cerveja.id)
  const cardVinho = await assignCard(cVinho.id, vinho.id)
  const cardCafe = await assignCard(cCafe.id, cafe.id)
  console.log('7 clientes atribuídos aos programas.')

  // ===== 4. Cartelas + selos, com datas/autoria históricas reais =====
  // desliga as 2 triggers de carimbo só durante este bloco.
  await client.query('alter table loyalty_stamps disable trigger loyalty_stamps_stamp')
  await client.query('alter table loyalty_cartelas disable trigger loyalty_cartelas_stamp_redemption')

  const { rows: [owner] } = await client.query(`select id from profiles where role = 'owner' limit 1`)
  const ownerId = owner?.id ?? null

  async function cartela(cardId, itemId, { stamps = 0, redeemedDaysAgo = null, stampStartDaysAgo = 30 } = {}) {
    const redeemedAt = redeemedDaysAgo !== null ? isoDate(daysAgo(redeemedDaysAgo)) : null
    const { rows: [line] } = await client.query(
      `insert into loyalty_cartelas (card_id, item_id, redeemed_at, redeemed_by)
       values ($1, $2, $3, $4) returning id`,
      [cardId, itemId, redeemedAt, redeemedAt ? ownerId : null]
    )
    for (let i = 0; i < stamps; i++) {
      const at = new Date(daysAgo(stampStartDaysAgo - i * 5))
      at.setHours(18 + (i % 4), 10 * i, 0, 0)
      await client.query(
        `insert into loyalty_stamps (cartela_id, recorded_by, recorded_at) values ($1, $2, $3)`,
        [line.id, ownerId, at.toISOString()]
      )
    }
    return line.id
  }

  // cliente fiel: 2 cartelas completas+resgatadas no item 56, + uma ativa com 4/5
  await cartela(cardFiel, itemIds.cerveja_56, { stamps: 5, redeemedDaysAgo: 90, stampStartDaysAgo: 100 })
  await cartela(cardFiel, itemIds.cerveja_56, { stamps: 5, redeemedDaysAgo: 40, stampStartDaysAgo: 60 })
  await cartela(cardFiel, itemIds.cerveja_56, { stamps: 4, stampStartDaysAgo: 25 })
  await cartela(cardFiel, itemIds.cerveja_33, { stamps: 2, stampStartDaysAgo: 20 })
  await cartela(cardFiel, itemIds.cerveja_28, { stamps: 1, stampStartDaysAgo: 10 })

  // cliente "quase lá": cartela do 56 completa (5/5), pronta pra resgatar
  await cartela(cardQuaseLa, itemIds.cerveja_56, { stamps: 5, stampStartDaysAgo: 35 })
  await cartela(cardQuaseLa, itemIds.cerveja_33, { stamps: 1, stampStartDaysAgo: 8 })

  // cliente com 1 resgate já feito + progresso atual
  await cartela(cardRedeemed, itemIds.cerveja_56, { stamps: 5, redeemedDaysAgo: 15, stampStartDaysAgo: 40 })
  await cartela(cardRedeemed, itemIds.cerveja_56, { stamps: 2, stampStartDaysAgo: 12 })
  await cartela(cardRedeemed, itemIds.cerveja_33, { stamps: 3, stampStartDaysAgo: 18 })

  // dois clientes com progresso só parcial
  await cartela(cardA, itemIds.cerveja_56, { stamps: 2, stampStartDaysAgo: 14 })
  await cartela(cardA, itemIds.cerveja_33, { stamps: 1, stampStartDaysAgo: 7 })
  await cartela(cardB, itemIds.cerveja_56, { stamps: 3, stampStartDaysAgo: 22 })
  await cartela(cardB, itemIds.cerveja_33, { stamps: 2, stampStartDaysAgo: 9 })

  // Clube do Vinho
  await cartela(cardVinho, itemIds.vinho_Tinto, { stamps: 2, stampStartDaysAgo: 16 })
  await cartela(cardVinho, itemIds.vinho_Branco, { stamps: 1, stampStartDaysAgo: 6 })

  // Café da Manhã — selos lançados ANTES do programa ser encerrado
  await cartela(cardCafe, itemIds.cafe, { stamps: 3, stampStartDaysAgo: 140 })

  await client.query('alter table loyalty_stamps enable trigger loyalty_stamps_stamp')
  await client.query('alter table loyalty_cartelas enable trigger loyalty_cartelas_stamp_redemption')
  console.log('Cartelas e selos criados com histórico realista.')

  // ===== 5. Encerra o Café da Manhã (depois que já tem cliente/selos) =====
  await client.query(
    `update loyalty_programs set is_active = false, deactivated_at = $1 where id = $2`,
    [isoDate(daysAgo(100)), cafe.id]
  )
  console.log('Programa "Café da Manhã" encerrado (pra testar o alerta na tela).')

  if (apply) {
    await client.query('commit')
    console.log('\n✅ Semente aplicada em staging.')
  } else {
    await client.query('rollback')
    console.log('\nDry-run — nada foi gravado (rollback). Rode com --apply para gravar de verdade.')
  }
} catch (e) {
  await client.query('rollback')
  console.error('\n❌ Erro — rollback de tudo:', e.message)
  process.exitCode = 1
} finally {
  await client.end()
}
