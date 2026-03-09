import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../../domain/entities/ListaCompra'

export class ObtenerListaPorId {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(id: number): Promise<ListaCompra | null> {
    return this.repo.obtenerPorId(id)
  }
}
