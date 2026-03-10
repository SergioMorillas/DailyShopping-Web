import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ShoppingCart } from 'lucide-react'
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

  const inputClass = "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/15 transition-all"

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f0fbfc 0%, #ffffff 60%)' }}>
      {/* Header */}
      <header className="shadow-md shadow-[#04bcd4]/15"
        style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0397aa 100%)' }}>
        <div className="max-w-2xl mx-auto flex items-center h-14 px-2">
          <button onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-all">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <ShoppingCart size={18} className="text-white/80" />
            <span className="font-black text-white tracking-tight">DailyShopping</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Crear cuenta</h1>
            <p className="text-gray-400 font-medium mt-1 text-sm">Empieza a gestionar tus compras</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ boxShadow: '0 4px 24px rgba(4,188,212,0.08)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Usuario
                </label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="tunombre" required autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required
                    className={inputClass + ' pr-12'}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type={showPass ? 'text' : 'password'} value={confirm}
                  onChange={e => setConfirm(e.target.value)} placeholder="Repite la contraseña" required
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm text-white disabled:opacity-50 transition-all active:scale-[0.98] mt-1"
                style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0397aa 100%)', boxShadow: '0 6px 20px rgba(4,188,212,0.30)' }}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 font-medium mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#04bcd4] font-black hover:text-[#0397aa] transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
