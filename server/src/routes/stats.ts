import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import db from '../database'

const router = Router()
router.use(authMiddleware)

router.get('/', (req: AuthRequest, res: Response): void => {
  const listas = db.prepare('SELECT * FROM listas_compra WHERE user_id = ?').all(req.userId) as any[]

  const listasConProductos = listas.map(l => ({
    ...l,
    productos: JSON.parse(l.productos) as any[]
  }))

  // Stats por supermercado
  const supMap: Record<string, { count: number; gasto: number }> = {}
  let gastoTotal = 0

  for (const lista of listasConProductos) {
    const s = lista.supermercado
    if (!supMap[s]) supMap[s] = { count: 0, gasto: 0 }
    supMap[s].count++
    const gastoLista = lista.productos.reduce((sum: number, p: any) => sum + ((p.price ?? 0) * (p.amount ?? 1)), 0)
    supMap[s].gasto += gastoLista
    gastoTotal += gastoLista
  }

  // Top productos
  const prodMap: Record<string, { count: number; gasto: number }> = {}
  for (const lista of listasConProductos) {
    for (const p of lista.productos) {
      const name = (p.name ?? 'Desconocido').trim()
      if (!name) continue
      if (!prodMap[name]) prodMap[name] = { count: 0, gasto: 0 }
      prodMap[name].count += p.amount ?? 1
      prodMap[name].gasto += (p.price ?? 0) * (p.amount ?? 1)
    }
  }
  const productosTop = Object.entries(prodMap)
    .map(([nombre, d]) => ({ nombre, count: d.count, gasto: Math.round(d.gasto * 100) / 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // Gasto mensual últimos 6 meses
  const ahora = Date.now()
  const meses: { key: string; label: string; gasto: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora)
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
    meses.push({ key, label, gasto: 0 })
  }

  for (const lista of listasConProductos) {
    const d = new Date(lista.fecha)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const mes = meses.find(m => m.key === key)
    if (mes) {
      const gastoLista = lista.productos.reduce((sum: number, p: any) => sum + ((p.price ?? 0) * (p.amount ?? 1)), 0)
      mes.gasto += gastoLista
    }
  }

  res.json({
    totalListas: listas.length,
    gastoTotal: Math.round(gastoTotal * 100) / 100,
    gastoMedio: listas.length > 0 ? Math.round((gastoTotal / listas.length) * 100) / 100 : 0,
    supermercados: Object.entries(supMap).map(([nombre, d]) => ({
      nombre,
      count: d.count,
      gasto: Math.round(d.gasto * 100) / 100
    })),
    productosTop,
    gastoMensual: meses.map(m => ({ mes: m.label, gasto: Math.round(m.gasto * 100) / 100 }))
  })
})

export default router
