import { ListaCompra } from '../entities/ListaCompra'

export interface IListaCompraRepository {
  obtenerTodas(): Promise<ListaCompra[]>
  obtenerPorId(id: number): Promise<ListaCompra | null>
  buscarPorNombre(query: string): Promise<ListaCompra[]>
  crear(lista: ListaCompra): Promise<ListaCompra>
  actualizar(lista: ListaCompra): Promise<ListaCompra>
  eliminar(id: number): Promise<void>
}
