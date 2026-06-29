/**
 * Switch entre as versões do site.
 *
 * - 'v1' → versão atual (landing page congelada em /v1)
 * - 'v2' → nova versão (em construção, servida na raiz /)
 *
 * Enquanto a nova versão NÃO estiver pronta, mantenha 'v1':
 * a raiz (/) redireciona automaticamente para /v1.
 *
 * Quando a v2 estiver pronta, troque para 'v2' e a raiz passa a
 * servir a nova versão. A v1 continua acessível em /v1.
 */
export const ACTIVE_VERSION: 'v1' | 'v2' = 'v2'
