import { ISupermercadoPort } from '../../domain/ports/ISupermercadoPort'
import { Producto } from '../../domain/entities/Producto'

export class MercadonaAdapter implements ISupermercadoPort {
  async buscarProductos(query: string): Promise<Producto[]> {
    const res = await fetch('/api/mercadona', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ params: `query=${encodeURIComponent(query)}` }),
    })
    if (!res.ok) throw new Error(`Mercadona ${res.status}: ${res.statusText}`)
    const data = await res.json()
    const hits: any[] = data.hits ?? []
    return hits
      .map(
        (h) =>
          new Producto({
            id: String(h.id),
            name: h.display_name ?? '',
            image: h.thumbnail ?? '',
            price: parseFloat(h.price_instructions?.unit_price ?? '0') || 0,
            pricePerKilo: parseFloat(h.price_instructions?.reference_price ?? '-1') || -1,
            mass: h.price_instructions?.unit_size ?? -1,
            amount: 1,
            marked: false,
            supermercado: 'Mercadona',
          })
      )
      .sort((a, b) => a.price - b.price)
  }
}
