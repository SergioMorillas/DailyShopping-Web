import { SupermercadoNombre } from '../../domain/entities/ListaCompra'
import { ProductoProps } from '../../domain/entities/Producto'

export interface CrearListaDTO {
  nombre: string
  fecha: number
  supermercado: SupermercadoNombre
}

export interface ListaCompraDTO {
  id: number
  nombre: string
  fecha: number
  supermercado: SupermercadoNombre
  productos: ProductoProps[]
  precioTotal: number
  cantidadProductos: number
}
