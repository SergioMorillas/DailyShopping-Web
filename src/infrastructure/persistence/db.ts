import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { ProductoProps } from '../../domain/entities/Producto'
import { SupermercadoNombre } from '../../domain/entities/ListaCompra'

export interface ListaCompraRecord {
  id?: number
  nombre: string
  fecha: number
  supermercado: SupermercadoNombre
  productos: ProductoProps[]
}

interface DailyShoppingDB extends DBSchema {
  listas_compra: {
    key: number
    value: ListaCompraRecord
    indexes: { 'by-nombre': string }
  }
}

let dbInstance: IDBPDatabase<DailyShoppingDB> | null = null

export async function getDB(): Promise<IDBPDatabase<DailyShoppingDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<DailyShoppingDB>('daily_shopping', 1, {
    upgrade(db) {
      const store = db.createObjectStore('listas_compra', {
        keyPath: 'id',
        autoIncrement: true,
      })
      store.createIndex('by-nombre', 'nombre')
    },
  })
  return dbInstance
}
