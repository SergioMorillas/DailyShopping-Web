export const SUPERMERCADOS_DISPONIBLES = ['Mercadona', 'Alcampo', 'Dia', 'BM', 'Carrefour'] as const
export type SupermercadoDisponible = typeof SUPERMERCADOS_DISPONIBLES[number]

export const SUPERMERCADO_COLORES: Record<SupermercadoDisponible, string> = {
  Mercadona: '#00834e',
  Alcampo: '#e30613',
  Dia: '#e3000f',
  BM: '#0066cc',
  Carrefour: '#004a96',
}

export const SUPERMERCADO_LOGOS: Record<SupermercadoDisponible, string> = {
  Mercadona: 'M',
  Alcampo: 'A',
  Dia: 'D',
  BM: 'BM',
  Carrefour: 'C',
}
