import { type ReactNode } from 'react'

/* ===== Badge de status ===== */
type Tone = 'ink' | 'ok' | 'warn' | 'danger' | 'muted' | 'outline'

const TONE: Record<Tone, string> = {
  ink: 'bg-ink text-paper border-ink',
  ok: 'bg-ok text-paper border-ok',
  warn: 'bg-warn text-paper border-warn',
  danger: 'bg-danger text-paper border-danger',
  muted: 'bg-g200 text-ink border-g200',
  outline: 'bg-transparent text-g600 border-g300',
}

export function Badge({ children, tone = 'muted' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`font-display text-[11px] tracking-wider px-2 py-1 border inline-block leading-none ${TONE[tone]}`}
    >
      {children}
    </span>
  )
}

/* ===== Toggle ===== */
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex items-center gap-2 group"
      aria-pressed={checked}
    >
      <span
        className={`w-9 h-5 border flex items-center transition-colors ${
          checked ? 'bg-ink border-ink justify-end' : 'bg-surface border-g300 justify-start'
        }`}
      >
        <span className={`w-4 h-4 ${checked ? 'bg-paper' : 'bg-g400'}`} />
      </span>
      {label && <span className="text-sm text-g600">{label}</span>}
    </button>
  )
}

/* ===== Modal ===== */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  width?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-ink2/70" onClick={onClose} />
      <div className={`relative z-10 w-full ${width} bg-surface border border-g300 shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-g200 px-6 py-4">
          <h3 className="font-display text-lg text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 border border-g300 text-ink hover:bg-ink hover:text-paper"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ===== Cabeçalho de página ===== */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="font-display text-3xl text-ink leading-none">{title}</h1>
        {subtitle && <p className="text-g600 text-sm mt-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ===== Card de métrica ===== */
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="bg-surface border border-g200 p-5">
      <div className="font-display text-[11px] tracking-widest text-g500">{label}</div>
      <div className="font-display text-4xl text-ink mt-2 leading-none">{value}</div>
      {hint && <div className="text-xs text-g500 mt-2">{hint}</div>}
    </div>
  )
}

/* ===== Botões ===== */
export function btn(variant: 'primary' | 'ghost' | 'danger' = 'primary'): string {
  const base =
    'font-display text-sm tracking-wide px-4 py-2.5 border inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  if (variant === 'primary') return `${base} bg-ink text-paper border-ink hover:bg-ink2`
  if (variant === 'danger') return `${base} bg-transparent text-danger border-danger hover:bg-danger hover:text-paper`
  return `${base} bg-surface text-ink border-g300 hover:border-ink`
}

/* ===== Inputs ===== */
export const inputCls =
  'w-full border border-g300 bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-display text-[11px] tracking-wider text-g500 block mb-1.5">{label}</span>
      {children}
    </label>
  )
}

/* ===== Helpers de domínio ===== */
export const LIVES_LABEL: Record<string, string> = {
  sim: 'Sim',
  freq: 'Frequente',
  nao: 'Não',
  na: 'N/D',
}

const VOUCHER: Record<string, { label: string; tone: Tone }> = {
  issued: { label: 'Emitido', tone: 'ink' },
  redeemed: { label: 'Utilizado', tone: 'ok' },
  expired: { label: 'Expirado', tone: 'muted' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
}

export function VoucherBadge({ status }: { status: string }) {
  const v = VOUCHER[status] ?? { label: status, tone: 'muted' as Tone }
  return <Badge tone={v.tone}>{v.label}</Badge>
}

/** Aviso de área exclusiva do Owner. */
export function Restricted() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-4xl mb-4">🔒</div>
      <h2 className="font-display text-xl text-ink">Acesso restrito</h2>
      <p className="text-g600 text-sm mt-2">
        Esta área é exclusiva do <b>Owner</b>. Altere o papel na barra superior para demonstrar.
      </p>
    </div>
  )
}
