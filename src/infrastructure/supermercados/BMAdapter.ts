import { ISupermercadoPort } from '../../domain/ports/ISupermercadoPort'
import { Producto } from '../../domain/entities/Producto'

export class BMAdapter implements ISupermercadoPort {
  async buscarProductos(query: string): Promise<Producto[]> {
    const res = await fetch(`/api/bm?q=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`BM ${res.status}: ${res.statusText}`)
    const data = await res.json()
    const productos: any[] = data?.catalog?.products ?? []
    return productos
      .map(
        (p) =>
          new Producto({
            id: String(p.ean),
            name: p.productData?.name ?? '',
            image: p.productData?.imageURL ?? '',
            price: p.priceData?.prices?.[0]?.value?.centAmount ?? 0,
            pricePerKilo: -1,
            mass: -1,
            amount: 1,
            marked: false,
            supermercado: 'BM',
          })
      )
      .sort((a, b) => a.price - b.price)
  }
}
