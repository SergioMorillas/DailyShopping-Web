import { Producto } from './Producto'

export type SupermercadoNombre = 'Mercadona' | 'Alcampo' | 'Dia' | 'BM'

export interface ListaCompraProps {
  id?: number
  nombre: string
  fecha: number
  supermercado: SupermercadoNombre
  productos: Producto[]
}

export class ListaCompra {
  readonly id?: number
  readonly nombre: string
  readonly fecha: number
  readonly supermercado: SupermercadoNombre
  readonly productos: Producto[]

  constructor(props: ListaCompraProps) {
    this.id = props.id
    this.nombre = props.nombre
    this.fecha = props.fecha
    this.supermercado = props.supermercado
    this.productos = props.productos
  }

  get precioTotal(): number {
    return this.productos.reduce((sum, p) => sum + p.precioTotal, 0)
  }

  get precioMarcado(): number {
    return this.productos
      .filter((p) => p.marked)
      .reduce((sum, p) => sum + p.precioTotal, 0)
  }

  get precioSinMarcar(): number {
    return this.productos
      .filter((p) => !p.marked)
      .reduce((sum, p) => sum + p.precioTotal, 0)
  }

  get precioPromedio(): number {
    if (this.productos.length === 0) return 0
    return this.precioTotal / this.productos.length
  }

  get cantidadProductos(): number {
    return this.productos.reduce((sum, p) => sum + p.amount, 0)
  }

  get fechaFormateada(): string {
    return new Date(this.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  withProductos(productos: Producto[]): ListaCompra {
    return new ListaCompra({ ...this.toProps(), productos })
  }

  toProps(): ListaCompraProps {
    return {
      id: this.id,
      nombre: this.nombre,
      fecha: this.fecha,
      supermercado: this.supermercado,
      productos: this.productos,
    }
  }
}
