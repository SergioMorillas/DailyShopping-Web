import { Router, Response } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import db from '../database'

const router = Router()
router.use(authMiddleware)

router.get('/', (req: AuthRequest, res: Response): void => {
  const listas = db.prepare('SELECT * FROM listas_compra WHERE user_id = ? ORDER BY fecha DESC').all(req.userId) as any[]
  res.json(listas.map(l => ({ ...l, productos: JSON.parse(l.productos) })))
})

router.get('/:id', (req: AuthRequest, res: Response): void => {
  const lista = db.prepare('SELECT * FROM listas_compra WHERE id = ? AND user_id = ?').get(req.params.id, req.userId) as any
  if (!lista) { res.status(404).json({ error: 'Lista no encontrada' }); return }
  res.json({ ...lista, productos: JSON.parse(lista.productos) })
})

router.post('/', (req: AuthRequest, res: Response): void => {
  const { nombre, fecha, supermercado, productos = [] } = req.body
  if (!nombre?.trim() || !supermercado) { res.status(400).json({ error: 'Nombre y supermercado requeridos' }); return }
  const result = db.prepare('INSERT INTO listas_compra (user_id, nombre, fecha, supermercado, productos) VALUES (?, ?, ?, ?, ?)').run(req.userId, nombre.trim(), fecha || Date.now(), supermercado, JSON.stringify(productos))
  const lista = db.prepare('SELECT * FROM listas_compra WHERE id = ?').get(result.lastInsertRowid) as any
  res.status(201).json({ ...lista, productos: JSON.parse(lista.productos) })
})

router.put('/:id', (req: AuthRequest, res: Response): void => {
  const lista = db.prepare('SELECT id FROM listas_compra WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!lista) { res.status(404).json({ error: 'Lista no encontrada' }); return }
  const { nombre, fecha, supermercado, productos } = req.body
  db.prepare('UPDATE listas_compra SET nombre = ?, fecha = ?, supermercado = ?, productos = ? WHERE id = ?').run(nombre, fecha, supermercado, JSON.stringify(productos ?? []), req.params.id)
  const updated = db.prepare('SELECT * FROM listas_compra WHERE id = ?').get(req.params.id) as any
  res.json({ ...updated, productos: JSON.parse(updated.productos) })
})

router.delete('/:id', (req: AuthRequest, res: Response): void => {
  const result = db.prepare('DELETE FROM listas_compra WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
  if (result.changes === 0) { res.status(404).json({ error: 'Lista no encontrada' }); return }
  res.status(204).end()
})

export default router
