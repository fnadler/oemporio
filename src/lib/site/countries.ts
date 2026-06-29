/**
 * Países (DDI) e distritos de Portugal — usados no modal do cupão (v2).
 * Portado de Prototipo Site (Antigravity)/o-emporio-site/js/main.js
 */

export interface Country {
  name: string
  ddi: string
  iso: string
}

/** Lista de países: [nome, DDI, ISO]. "Outro" tem DDI vazio (apenas para "Onde nasceu"). */
const RAW: [string, string, string][] = [
  ['Portugal', '+351', 'PT'], ['Brasil', '+55', 'BR'], ['África do Sul', '+27', 'ZA'],
  ['Alemanha', '+49', 'DE'], ['Angola', '+244', 'AO'], ['Arábia Saudita', '+966', 'SA'],
  ['Argentina', '+54', 'AR'], ['Austrália', '+61', 'AU'], ['Áustria', '+43', 'AT'],
  ['Bélgica', '+32', 'BE'], ['Bolívia', '+591', 'BO'], ['Bulgária', '+359', 'BG'],
  ['Cabo Verde', '+238', 'CV'], ['Canadá', '+1', 'CA'], ['Catar', '+974', 'QA'],
  ['Chile', '+56', 'CL'], ['China', '+86', 'CN'], ['Chipre', '+357', 'CY'],
  ['Colômbia', '+57', 'CO'], ['Coreia do Sul', '+82', 'KR'], ['Croácia', '+385', 'HR'],
  ['Dinamarca', '+45', 'DK'], ['Egito', '+20', 'EG'], ['Emirados Árabes Unidos', '+971', 'AE'],
  ['Equador', '+593', 'EC'], ['Eslováquia', '+421', 'SK'], ['Eslovénia', '+386', 'SI'],
  ['Espanha', '+34', 'ES'], ['Estados Unidos', '+1', 'US'], ['Estónia', '+372', 'EE'],
  ['Filipinas', '+63', 'PH'], ['Finlândia', '+358', 'FI'], ['França', '+33', 'FR'],
  ['Grécia', '+30', 'GR'], ['Guiné-Bissau', '+245', 'GW'], ['Holanda', '+31', 'NL'],
  ['Hungria', '+36', 'HU'], ['Índia', '+91', 'IN'], ['Indonésia', '+62', 'ID'],
  ['Irlanda', '+353', 'IE'], ['Islândia', '+354', 'IS'], ['Israel', '+972', 'IL'],
  ['Itália', '+39', 'IT'], ['Japão', '+81', 'JP'], ['Letónia', '+371', 'LV'],
  ['Líbano', '+961', 'LB'], ['Lituânia', '+370', 'LT'], ['Luxemburgo', '+352', 'LU'],
  ['Malásia', '+60', 'MY'], ['Malta', '+356', 'MT'], ['Marrocos', '+212', 'MA'],
  ['México', '+52', 'MX'], ['Moçambique', '+258', 'MZ'], ['Nigéria', '+234', 'NG'],
  ['Noruega', '+47', 'NO'], ['Nova Zelândia', '+64', 'NZ'], ['Paraguai', '+595', 'PY'],
  ['Peru', '+51', 'PE'], ['Polónia', '+48', 'PL'], ['Reino Unido', '+44', 'GB'],
  ['República Checa', '+420', 'CZ'], ['Roménia', '+40', 'RO'], ['Rússia', '+7', 'RU'],
  ['São Tomé e Príncipe', '+239', 'ST'], ['Singapura', '+65', 'SG'], ['Suécia', '+46', 'SE'],
  ['Suíça', '+41', 'CH'], ['Tailândia', '+66', 'TH'], ['Timor-Leste', '+670', 'TL'],
  ['Tunísia', '+216', 'TN'], ['Turquia', '+90', 'TR'], ['Ucrânia', '+380', 'UA'],
  ['Uruguai', '+598', 'UY'], ['Venezuela', '+58', 'VE'], ['Vietname', '+84', 'VN'],
  ['Outro', '', ''],
]

export const COUNTRIES: Country[] = RAW.map(([name, ddi, iso]) => ({ name, ddi, iso }))

/** Países com DDI (para o seletor de telefone). */
export const DIAL_CODES: Country[] = COUNTRIES.filter((c) => c.ddi)

/** Distritos / regiões autónomas de Portugal. */
export const DISTRICTS: string[] = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro',
  'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal',
  'Viana do Castelo', 'Vila Real', 'Viseu', 'R.A. Açores', 'R.A. Madeira',
]

/** Emoji da bandeira a partir do código ISO de 2 letras. */
export function flag(iso: string): string {
  if (!iso) return ''
  return iso
    .toUpperCase()
    .replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0)))
}
