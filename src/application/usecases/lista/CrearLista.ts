import { IListaCompraRepository } from '../../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../../domain/entities/ListaCompra'
import { CrearListaDTO } from '../../dtos/ListaCompraDTO'

export class CrearLista {
  constructor(private readonly repo: IListaCompraRepository) {}

  async ejecutar(dto: CrearListaDTO): Promise<ListaCompra> {
    if (!dto.nombre.trim()) throw new Error('El nombre de la lista no puede estar vacío')
    const lista = new ListaCompra({ ...dto, productos: [] })
    return this.repo.crear(lista)
  }
}
