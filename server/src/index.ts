import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import listasRoutes from './routes/listas'
import statsRoutes from './routes/stats'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/listas', listasRoutes)
app.use('/api/stats', statsRoutes)

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
