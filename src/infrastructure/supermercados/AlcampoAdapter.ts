import { ISupermercadoPort } from '../../domain/ports/ISupermercadoPort'
import { Producto } from '../../domain/entities/Producto'

export class AlcampoAdapter implements ISupermercadoPort {
  async buscarProductos(query: string): Promise<Producto[]> {
    const params = new URLSearchParams({
      includeAdditionalPageInfo: 'true',
      maxPageSize: '300',
      maxProductsToDecorate: '50',
      q: query,
      tag: 'web',
    })
    const res = await fetch(`/api/alcampo?${params}`)
    if (!res.ok) throw new Error(`Alcampo ${res.status}: ${res.statusText}`)
    const data = await res.json()

    const grupos: any[] = data?.productGroups ?? []
    const productos: Producto[] = []

    for (const grupo of grupos) {
      const decorados: any[] = grupo.decoratedProducts ?? []
      for (const p of decorados) {
        const price = parseFloat(p.price?.amount ?? '0') || 0
        const pricePerKilo = parseFloat(p.unitPrice?.price?.amount ?? '0') || -1
        const massStr: string = p.packSizeDescription ?? ''
        const massMatch = massStr.match(/(\d+)/)
        const mass = massMatch ? parseFloat(massMatch[1]) : -1

        productos.push(new Producto({
          id: String(p.productId),
          name: p.name ?? '',
          image: p.image?.src ?? '',
          price,
          pricePerKilo,
          mass,
          amount: 1,
          marked: false,
          supermercado: 'Alcampo',
        }))
      }
    }

    // Deduplicar por productId y ordenar por precio
    const vistos = new Set<string>()
    return productos
      .filter((p) => { if (vistos.has(p.id)) return false; vistos.add(p.id); return true })
      .sort((a, b) => a.price - b.price)
  }
}
