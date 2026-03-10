import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

export function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(s => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
      setAuth(data.token, data.user)
      navigate('/listas', { replace: true })
    } catch { setError('No se pudo conectar con el servidor') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f0fbfc 0%, #ffffff 60%)' }}>
      {/* Header — mismo estilo que AppHeader */}
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
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bienvenido</h1>
            <p className="text-gray-400 font-medium mt-1 text-sm">Inicia sesión para acceder a tus listas</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm" style={{ boxShadow: '0 4px 24px rgba(4,188,212,0.08)' }}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com" required autoFocus
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/15 transition-all"
                />
              </div>

              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/15 transition-all pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-semibold px-3 py-2.5 rounded-xl">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-black text-sm text-white disabled:opacity-50 transition-all active:scale-[0.98] mt-1"
                style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0397aa 100%)', boxShadow: '0 6px 20px rgba(4,188,212,0.30)' }}>
                {loading ? 'Entrando...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 font-medium mt-5">
              ¿Sin cuenta?{' '}
              <Link to="/registro" className="text-[#04bcd4] font-black hover:text-[#0397aa] transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
