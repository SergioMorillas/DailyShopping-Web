import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../database'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'daily-shopping-secret-dev'

router.post('/register', (req: Request, res: Response): void => {
  const { username, email, password } = req.body
  if (!username?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'Todos los campos son obligatorios' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    return
  }
  try {
    const hash = bcrypt.hashSync(password, 10)
    const stmt = db.prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
    const result = stmt.run(username.trim(), email.trim().toLowerCase(), hash, Date.now())
    const userId = result.lastInsertRowid as number
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ token, user: { id: userId, username: username.trim(), email: email.trim().toLowerCase() } })
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(409).json({ error: 'El usuario o email ya existe' })
    } else {
      res.status(500).json({ error: 'Error interno' })
    }
  }
})

router.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body
  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' })
    return
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.trim().toLowerCase()) as any
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Credenciales incorrectas' })
    return
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

router.put('/password', authMiddleware, (req: AuthRequest, res: Response): void => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Campos requeridos' }); return
  }
  if (newPassword.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' }); return
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get((req as AuthRequest).userId) as any
  if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
    res.status(401).json({ error: 'Contraseña actual incorrecta' }); return
  }
  const newHash = bcrypt.hashSync(newPassword, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, (req as AuthRequest).userId)
  res.json({ ok: true })
})

export default router
