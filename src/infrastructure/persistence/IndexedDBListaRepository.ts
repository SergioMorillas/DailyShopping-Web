import { IListaCompraRepository } from '../../domain/ports/IListaCompraRepository'
import { ListaCompra } from '../../domain/entities/ListaCompra'
import { Producto } from '../../domain/entities/Producto'
import { getDB } from './db'

export class IndexedDBListaRepository implements IListaCompraRepository {
  private toEntity(record: { id?: number; nombre: string; fecha: number; supermercado: any; productos: any[] }): ListaCompra {
    return new ListaCompra({
      id: record.id,
      nombre: record.nombre,
      fecha: record.fecha,
      supermercado: record.supermercado,
      productos: record.productos.map((p) => new Producto(p)),
    })
  }

  async obtenerTodas(): Promise<ListaCompra[]> {
    const db = await getDB()
    const records = await db.getAll('listas_compra')
    return records.map((r) => this.toEntity(r))
  }

  async obtenerPorId(id: number): Promise<ListaCompra | null> {
    const db = await getDB()
    const record = await db.get('listas_compra', id)
    return record ? this.toEntity(record) : null
  }

  async buscarPorNombre(query: string): Promise<ListaCompra[]> {
    const todas = await this.obtenerTodas()
    const q = query.toLowerCase()
    return todas.filter((l) => l.nombre.toLowerCase().includes(q))
  }

  async crear(lista: ListaCompra): Promise<ListaCompra> {
    const db = await getDB()
    const id = await db.add('listas_compra', {
      nombre: lista.nombre,
      fecha: lista.fecha,
      supermercado: lista.supermercado,
      productos: lista.productos.map((p) => p.toProps()),
    })
    return new ListaCompra({ ...lista.toProps(), id: id as number })
  }

  async actualizar(lista: ListaCompra): Promise<ListaCompra> {
    if (!lista.id) throw new Error('Lista sin ID no puede actualizarse')
    const db = await getDB()
    await db.put('listas_compra', {
      id: lista.id,
      nombre: lista.nombre,
      fecha: lista.fecha,
      supermercado: lista.supermercado,
      productos: lista.productos.map((p) => p.toProps()),
    })
    return lista
  }

  async eliminar(id: number): Promise<void> {
    const db = await getDB()
    await db.delete('listas_compra', id)
  }
}
