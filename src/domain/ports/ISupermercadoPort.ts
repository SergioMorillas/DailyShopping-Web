import { Producto } from '../entities/Producto'

export interface ISupermercadoPort {
  buscarProductos(query: string): Promise<Producto[]>
}
