import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../../domain/entities/ListaCompra'

export class ActualizarLista {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(lista: ListaCompra): Promise<ListaCompra> {
    return this.repo.actualizar(lista)
  }
}
