import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../../domain/entities/ListaCompra'

export class BuscarListas {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(query: string): Promise<ListaCompra[]> {
    if (!query.trim()) return []
    return this.repo.buscarPorNombre(query.trim())
  }
}
