import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../../domain/entities/ListaCompra'

export class ObtenerListas {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(): Promise<ListaCompra[]> {
    const listas = await this.repo.obtenerTodas()
    return listas.sort((a, b) => b.fecha - a.fecha)
  }
}
