import { Producto } from '../entities/Producto'

export type ResultadoIntento = 'correcto' | 'tolerancia' | 'alto' | 'bajo'

export interface Intento {
  valor: number
  resultado: ResultadoIntento
}

export class JuegoPreciosService {
  private readonly TOLERANCIA = 0.25
  private readonly MAX_INTENTOS = 3

  evaluarIntento(producto: Producto, intento: number): ResultadoIntento {
    const precio = producto.price
    const diferencia = Math.abs(intento - precio) / precio

    if (diferencia === 0 || intento === precio) return 'correcto'
    if (diferencia <= this.TOLERANCIA) return 'tolerancia'
    if (intento > precio) return 'alto'
    return 'bajo'
  }

  esAcierto(resultado: ResultadoIntento): boolean {
    return resultado === 'correcto' || resultado === 'tolerancia'
  }

  get maxIntentos(): number {
    return this.MAX_INTENTOS
  }
}
