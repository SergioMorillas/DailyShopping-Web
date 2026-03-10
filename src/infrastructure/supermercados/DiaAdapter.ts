import { ISupermercadoPort } from '../../domain/ports/ISupermercadoPort'
import { Producto } from '../../domain/entities/Producto'

export class DiaAdapter implements ISupermercadoPort {
  async buscarProductos(query: string): Promise<Producto[]> {
    const res = await fetch(`/api/dia?q=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`Dia ${res.status}: ${res.statusText}`)
    const data = await res.json()
    const items: any[] = data?.search_items ?? []
    return items
      .map(
        (p) =>
          new Producto({
            id: String(p.object_id),
            name: p.display_name ?? '',
            image: p.image ? `https://www.dia.es${p.image}` : '',
            price: p.prices?.price ?? 0,
            pricePerKilo: p.prices?.price_per_unit ?? -1,
            mass: -1,
            amount: 1,
            marked: false,
            supermercado: 'Dia',
          })
      )
      .sort((a, b) => a.price - b.price)
  }
}
