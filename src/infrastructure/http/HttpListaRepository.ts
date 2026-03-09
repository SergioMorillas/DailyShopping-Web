import { IListaCompraRepository } from '../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../domain/entities/ListaCompra'
import { Producto } from '../../domain/entities/Producto'

export class HttpListaRepository implements IListaCompraRepository {
  constructor(private readonly getToken: () => string | null) {}

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
    }
  }

  private toEntity(data: any): ListaCompra {
    return new ListaCompra({
      id: data.id,
      nombre: data.nombre,
      fecha: data.fecha,
      supermercado: data.supermercado,
      productos: (data.productos ?? []).map((p: any) => new Producto(p)),
    })
  }

  async obtenerTodas(): Promise<ListaCompra[]> {
    const res = await fetch('/api/listas', { headers: this.headers })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    return data.map((d: any) => this.toEntity(d))
  }

  async obtenerPorId(id: number): Promise<ListaCompra | null> {
    const res = await fetch(`/api/listas/${id}`, { headers: this.headers })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return this.toEntity(await res.json())
  }

  async buscarPorNombre(query: string): Promise<ListaCompra[]> {
    const todas = await this.obtenerTodas()
    return todas.filter(l => l.nombre.toLowerCase().includes(query.toLowerCase()))
  }

  async crear(lista: ListaCompra): Promise<ListaCompra> {
    const res = await fetch('/api/listas', {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        nombre: lista.nombre,
        fecha: lista.fecha,
        supermercado: lista.supermercado,
        productos: lista.productos.map(p => p.toProps()),
      }),
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return this.toEntity(await res.json())
  }

  async actualizar(lista: ListaCompra): Promise<ListaCompra> {
    if (!lista.id) throw new Error('Lista sin ID')
    const res = await fetch(`/api/listas/${lista.id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({
        nombre: lista.nombre,
        fecha: lista.fecha,
        supermercado: lista.supermercado,
        productos: lista.productos.map(p => p.toProps()),
      }),
    })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    return this.toEntity(await res.json())
  }

  async eliminar(id: number): Promise<void> {
    const res = await fetch(`/api/listas/${id}`, { method: 'DELETE', headers: this.headers })
    if (!res.ok) throw new Error(`Error ${res.status}`)
  }
}
