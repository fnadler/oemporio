#!/usr/bin/env node
/**
 * ETL: migra a tabela legada `leads` (produção) para `customers` + `vouchers`
 * (schema novo). Ver mapeamento de campos em
 * "Especificacao Tecnica - Backend.md" §2 ("Migração dos dados legados").
 *
 * Só LÊ de produção (nunca escreve nela) e escreve no projeto de destino
 * indicado por --target (staging por padrão). Idempotente: pula e-mails que
 * já existem em `customers` no destino, então pode rodar de novo sem
 * duplicar.
 *
 * Uso:
 *   node scripts/migrate-leads.mjs                 # dry-run contra staging
 *   node scripts/migrate-leads.mjs --apply          # aplica de verdade em staging
 *   node scripts/migrate-leads.mjs --apply --target=prod   # aplica em produção
 *
 * Credenciais: lidas de .env (produção) e .env.staging (staging) — cada
 * arquivo é parseado isoladamente para não misturar as duas bases (as duas
 * usam os mesmos nomes de variável).
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const targetArg = args.find((a) => a.startsWith('--target='))
const target = targetArg ? targetArg.split('=')[1] : 'staging'

if (!['staging', 'prod'].includes(target)) {
  console.error(`--target inválido: ${target} (use staging ou prod)`)
  process.exit(1)
}

function parseEnvFile(path) {
  const out = {}
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    out[key] = value
  }
  return out
}

const prodEnv = parseEnvFile(new URL('../.env', import.meta.url))
const stagingEnv = parseEnvFile(new URL('../.env.staging', import.meta.url))
const targetEnv = target === 'prod' ? prodEnv : stagingEnv

const prod = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY)
const dest = createClient(targetEnv.NEXT_PUBLIC_SUPABASE_URL, targetEnv.SUPABASE_SERVICE_ROLE_KEY)

console.log(`Modo: ${apply ? 'APLICAR' : 'DRY-RUN (nada será gravado)'} · destino: ${target}\n`)

// --- 1. Ler leads (produção) ---
const { data: leads, error: leadsErr } = await prod
  .from('leads')
  .select('*')
  .order('criado_em', { ascending: true })

if (leadsErr) {
  console.error('Erro lendo leads de produção:', leadsErr)
  process.exit(1)
}
console.log(`${leads.length} leads encontrados em produção.`)

// --- 2. Ler customers já existentes no destino (idempotência por e-mail) ---
const { data: existingCustomers, error: existingErr } = await dest
  .from('customers')
  .select('id, email')
if (existingErr) {
  console.error(`Erro lendo customers de ${target}:`, existingErr)
  process.exit(1)
}
const existingEmails = new Set(existingCustomers.map((c) => c.email.toLowerCase()))

// --- 3. Ler validade do voucher configurada (para status retroativo) ---
const { data: settingsRows, error: settingsErr } = await dest
  .from('site_settings')
  .select('welcome_voucher_validity_days, welcome_voucher_pct')
  .limit(1)
if (settingsErr) {
  console.error(`Erro lendo site_settings de ${target}:`, settingsErr)
  process.exit(1)
}
const validityDays = settingsRows[0]?.welcome_voucher_validity_days ?? 30
const discountPct = settingsRows[0]?.welcome_voucher_pct ?? 20

// --- 4. Códigos de voucher já usados no destino (evita colisão) ---
const { data: existingVouchers } = await dest.from('vouchers').select('code')
const usedCodes = new Set((existingVouchers ?? []).map((v) => v.code))

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem 0/O/1/I (ambíguos)
  let code
  do {
    let s = ''
    for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)]
    code = `EMP-${s}`
  } while (usedCodes.has(code))
  usedCodes.add(code)
  return code
}

function splitPhone(telefone) {
  const s = (telefone || '').trim()
  const i = s.indexOf(' ')
  if (i === -1) return { dialcode: '', number: s }
  return { dialcode: s.slice(0, i), number: s.slice(i + 1) }
}

function mapLanguage(idioma) {
  return idioma === 'en' ? 'en' : 'pt'
}

// --- 5. Transformar e (se --apply) gravar ---
let toMigrate = 0
let skipped = 0
let vouchersIssued = 0
let vouchersRedeemed = 0
let vouchersExpired = 0

const now = Date.now()

for (const lead of leads) {
  const email = (lead.email || '').toLowerCase()
  if (!email || existingEmails.has(email)) {
    skipped++
    continue
  }
  toMigrate++

  const { dialcode, number } = splitPhone(lead.telefone)
  const customerPayload = {
    first_name: lead.primeiro_nome || '',
    last_name: lead.sobrenome || '',
    phone_dialcode: dialcode,
    phone_number: number,
    email,
    language: mapLanguage(lead.idioma_preferido),
    birth_country: '', // não existe em `leads` — ver nota na spec §2
    lives_in_portugal: 'na', // idem
    district: '', // idem
    consent_coupon: !!lead.aceitou_cupom,
    consent_marketing: !!lead.aceitou_marketing,
    consent_version: null, // desconhecida para dados legados
    consent_at: lead.criado_em,
    source: 'site_form',
    created_at: lead.criado_em,
  }

  let voucherPayload = null
  if (lead.aceitou_cupom) {
    const issuedAt = new Date(lead.criado_em)
    const expiresAt = new Date(issuedAt.getTime() + validityDays * 86400000)
    let status
    if (lead.cupom_utilizado) {
      status = 'redeemed'
      vouchersRedeemed++
    } else if (expiresAt.getTime() < now) {
      status = 'expired'
      vouchersExpired++
    } else {
      status = 'issued'
      vouchersIssued++
    }
    voucherPayload = {
      code: genCode(),
      type: 'welcome_20',
      discount_pct: discountPct,
      status,
      issued_at: issuedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      // redeemed_at/redeemed_by desconhecidos para dados legados — não
      // fabricamos uma data; ficam null mesmo quando status = 'redeemed'.
    }
  }

  if (!apply) continue

  const { data: inserted, error: custErr } = await dest
    .from('customers')
    .insert(customerPayload)
    .select('id')
    .single()
  if (custErr) {
    console.error(`Falha ao migrar customer ${email}:`, custErr.message)
    continue
  }

  if (voucherPayload) {
    const { error: vErr } = await dest
      .from('vouchers')
      .insert({ ...voucherPayload, customer_id: inserted.id })
    if (vErr) console.error(`Falha ao criar voucher para ${email}:`, vErr.message)
  }
}

console.log(`\nA migrar: ${toMigrate}  ·  já existentes (pulados): ${skipped}`)
console.log(
  `Vouchers → issued: ${vouchersIssued}  redeemed: ${vouchersRedeemed}  expired (retroativo, > ${validityDays}d): ${vouchersExpired}`
)
if (!apply) {
  console.log('\nDry-run — nada foi gravado. Rode com --apply para migrar de verdade.')
} else {
  console.log(`\nMigração aplicada em ${target}.`)
}
