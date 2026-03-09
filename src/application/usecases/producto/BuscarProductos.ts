import { ISupermercadoPort } from '../../../domain/ports/ISupermercadoPort'
import { Producto } from '../../../domain/entities/Producto'
import { SupermercadoDisponible } from '../../../domain/entities/SupermercadoDisponible'

export class BuscarProductos {
  constructor(private readonly adapters: Map<SupermercadoDisponible, ISupermercadoPort>) {}

  async ejecutar(query: string, supermercado: SupermercadoDisponible): Promise<Producto[]> {
    const adapter = this.adapters.get(supermercado)
    if (!adapter) throw new Error(`Supermercado ${supermercado} no disponible`)
    return adapter.buscarProductos(query)
  }
}
