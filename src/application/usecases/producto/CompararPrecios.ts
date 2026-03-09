import { ISupermercadoPort } from '../../../domain/ports/ISupermercadoPort'
import { Producto } from '../../../domain/entities/Producto'
import { SupermercadoDisponible } from '../../../domain/entities/SupermercadoDisponible'

export interface ResultadoComparacion {
  supermercado: SupermercadoDisponible
  productos: Producto[]
  error?: string
}

export class CompararPrecios {
  constructor(private readonly adapters: Map<SupermercadoDisponible, ISupermercadoPort>) {}

  async ejecutar(query: string): Promise<ResultadoComparacion[]> {
    const entries = Array.from(this.adapters.entries())
    const resultados = await Promise.allSettled(
      entries.map(async ([supermercado, adapter]) => {
        const productos = await adapter.buscarProductos(query)
        return { supermercado, productos, } as ResultadoComparacion
      })
    )

    return resultados.map((r, i) => {
      if (r.status === 'fulfilled') return r.value
      return { supermercado: entries[i][0], productos: [], error: 'No disponible' }
    })
  }
}
