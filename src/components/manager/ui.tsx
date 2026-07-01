import { type ChangeEvent, type ReactNode } from 'react'

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
        className={`w-12 h-7 border flex items-center p-0.5 transition-colors ${
          checked ? 'bg-ink border-ink justify-end' : 'bg-surface border-g300 justify-start'
        }`}
      >
        <span className={`w-5 h-5 transition-colors ${checked ? 'bg-paper' : 'bg-g400'}`} />
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
            className="w-11 h-11 shrink-0 border border-g300 text-ink text-xl leading-none hover:bg-ink hover:text-paper transition-colors"
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

/* ===== Diálogo de confirmação (touch-friendly) ===== */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Voltar',
  tone = 'primary',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null
  const confirmCls =
    tone === 'danger'
      ? 'bg-danger text-paper border-danger'
      : 'bg-ink text-paper border-ink hover:bg-ink2'
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {message && <div className="text-[15px] leading-relaxed text-g600 mb-6">{message}</div>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 min-h-13 px-5 border border-g300 bg-surface text-ink font-display text-sm tracking-wide hover:border-ink transition-colors"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={`flex-1 min-h-13 px-5 border font-display text-sm tracking-wide transition-colors ${confirmCls}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
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
    'font-display text-sm tracking-wide min-h-11 px-4 py-2.5 border inline-flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
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

/* ===== Select (droplist) =====
   Native <select> sem a seta do sistema (appearance-none): espaço interno
   à direita (pr-9) para a seta nunca colar na borda, com chevron próprio. */
export const selectCls =
  'w-full appearance-none border border-g300 bg-surface pl-3 pr-9 py-2.5 text-sm text-ink outline-none cursor-pointer transition-colors hover:border-g400 focus:border-ink disabled:bg-subtle disabled:text-g500 disabled:cursor-not-allowed disabled:hover:border-g300'

export function Select({
  value,
  onChange,
  children,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
}: {
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
  className?: string
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <div className={`relative inline-flex group ${className}`}>
      <select className={selectCls} value={value} onChange={onChange} disabled={disabled} aria-label={ariaLabel}>
        {children}
      </select>
      <svg
        viewBox="0 0 12 12"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-g500 group-focus-within:text-ink transition-colors"
      >
        <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </div>
  )
}

/* ===== Paginação ===== */
function pageItems(page: number, count: number): (number | 'gap')[] {
  const items: (number | 'gap')[] = []
  for (let i = 1; i <= count; i++) {
    if (i === 1 || i === count || (i >= page - 1 && i <= page + 1)) {
      items.push(i)
    } else if (items[items.length - 1] !== 'gap') {
      items.push('gap')
    }
  }
  return items
}

export function Pagination({
  page,
  pageCount,
  onPage,
  className = '',
}: {
  page: number
  pageCount: number
  onPage: (p: number) => void
  className?: string
}) {
  if (pageCount <= 1) return null
  const cell =
    'min-w-11 h-11 px-3 border inline-flex items-center justify-center text-sm font-display transition-colors'
  const idle = 'border-g300 bg-surface text-ink hover:border-ink'
  const arrow = `${cell} ${idle} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-g300`

  return (
    <nav className={`flex items-center gap-1.5 ${className}`} aria-label="Paginação">
      <button
        type="button"
        className={arrow}
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ‹
      </button>
      {pageItems(page, pageCount).map((it, i) =>
        it === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-g400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => onPage(it)}
            aria-current={it === page ? 'page' : undefined}
            className={`${cell} ${it === page ? 'bg-ink text-paper border-ink' : idle}`}
          >
            {it}
          </button>
        ),
      )}
      <button
        type="button"
        className={arrow}
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount}
        aria-label="Próxima página"
      >
        ›
      </button>
    </nav>
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
