export interface ProductoProps {
  id: string
  name: string
  image: string
  price: number
  pricePerKilo: number
  mass: number
  amount: number
  marked: boolean
  supermercado?: string
}

export class Producto {
  readonly id: string
  readonly name: string
  readonly image: string
  readonly price: number
  readonly pricePerKilo: number
  readonly mass: number
  amount: number
  marked: boolean
  readonly supermercado?: string

  constructor(props: ProductoProps) {
    this.id = props.id
    this.name = props.name
    this.image = props.image
    this.price = props.price
    this.pricePerKilo = props.pricePerKilo
    this.mass = props.mass
    this.amount = props.amount
    this.marked = props.marked
    this.supermercado = props.supermercado
  }

  get precioTotal(): number {
    return this.price * this.amount
  }

  get hasPricePerKilo(): boolean {
    return this.pricePerKilo > 0
  }

  get hasMass(): boolean {
    return this.mass > 0
  }

  withAmount(amount: number): Producto {
    return new Producto({ ...this.toProps(), amount })
  }

  withMarked(marked: boolean): Producto {
    return new Producto({ ...this.toProps(), marked })
  }

  toProps(): ProductoProps {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      price: this.price,
      pricePerKilo: this.pricePerKilo,
      mass: this.mass,
      amount: this.amount,
      marked: this.marked,
      supermercado: this.supermercado,
    }
  }
}
