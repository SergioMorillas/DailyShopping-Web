import { Producto } from '../entities/Producto'

export class PrecioCalculatorService {
  formatearPrecio(precio: number): string {
    return precio.toFixed(2).replace('.', ',') + ' €'
  }

  ordenarPorPrecio(productos: Producto[]): Producto[] {
    return [...productos].sort((a, b) => a.price - b.price)
  }

  calcularAhorro(precioOriginal: number, precioNuevo: number): number {
    return Math.max(0, precioOriginal - precioNuevo)
  }
}
