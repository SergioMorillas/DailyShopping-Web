import { ISupermercadoPort } from '../../domain/ports/ISupermercadoPort'
import { Producto } from '../../domain/entities/Producto'

export class CarrefourAdapter implements ISupermercadoPort {
  async buscarProductos(query: string): Promise<Producto[]> {
    const res = await fetch(`/api/carrefour?lang=es&query=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`Carrefour ${res.status}: ${res.statusText}`)
    const data = await res.json()
    const docs: any[] = data?.content?.docs ?? []
    return docs
      .map((p) => {
        const price = p.active_price ?? 0
        const mass = p.average_weight ?? -1
        const pricePerKilo = mass > 0 ? price / (mass / 1000) : -1
        return new Producto({
          id: String(p.catalog_ref_id),
          name: p.display_name ?? '',
          image: p.image_path ?? '',
          price,
          pricePerKilo,
          mass,
          amount: 1,
          marked: false,
          supermercado: 'Carrefour',
        })
      })
      .sort((a, b) => a.price - b.price)
  }
}
