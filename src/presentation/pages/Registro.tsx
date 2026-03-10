import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export function Registro() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al registrarse'); return }
      setAuth(data.token, data.user)
      navigate('/listas', { replace: true })
    } catch { setError('No se pudo conectar con el servidor') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0f2a38 50%, #082030 100%)' }}>
      {/* Back */}
      <div className="p-4">
        <button onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Inicio
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl shadow-[#04bcd4]/30"
              style={{ background: 'linear-gradient(135deg, #04bcd4, #0280a0)' }}>
              <span className="text-white font-black text-2xl">D</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Crear cuenta</h1>
            <p className="text-white/40 text-sm font-medium mt-1">Únete a DailyShopping</p>
          </div>

          {/* Card */}
          <div className="bg-white/8 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-1.5">Usuario</label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="tunombre" required
                  className="w-full px-4 py-3.5 bg-white/10 rounded-xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-[#04bcd4]/50 transition-all border border-white/10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" required
                  className="w-full px-4 py-3.5 bg-white/10 rounded-xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-[#04bcd4]/50 transition-all border border-white/10"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required
                    className="w-full px-4 py-3.5 bg-white/10 rounded-xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-[#04bcd4]/50 transition-all border border-white/10 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block mb-1.5">Confirmar contraseña</label>
                <input
                  type={showPass ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required
                  className="w-full px-4 py-3.5 bg-white/10 rounded-xl text-white placeholder-white/30 text-sm font-medium focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-[#04bcd4]/50 transition-all border border-white/10"
                />
              </div>

              {error && (
                <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm mt-1 disabled:opacity-50 transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #04bcd4, #0280a0)', color: 'white', boxShadow: '0 8px 24px rgba(4,188,212,0.35)' }}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-xs text-white/40 font-medium mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#04bcd4] font-bold hover:text-[#5dd9ea] transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
