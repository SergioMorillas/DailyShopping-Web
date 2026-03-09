import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'

export class EliminarLista {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(id: number): Promise<void> {
    await this.repo.eliminar(id)
  }
}
