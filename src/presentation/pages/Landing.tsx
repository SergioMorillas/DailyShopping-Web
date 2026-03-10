import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Gamepad2, ChevronRight, GitCompare } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect } from 'react'

export function Landing() {
  const navigate = useNavigate()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (token) navigate('/listas', { replace: true })
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 bg-[#04bcd4] flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
            <ShoppingCart size={28} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          Daily<span className="text-white/80">Shopping</span>
        </h1>
        <p className="text-lg text-white/90 max-w-md mb-10 leading-relaxed">
          Tu lista de la compra inteligente. Busca productos reales, compara precios entre supermercados y ahorra en cada compra.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate('/registro')}
            className="px-8 py-3.5 bg-white text-[#04bcd4] rounded-2xl font-semibold text-base hover:bg-white/90 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            Crear cuenta <ChevronRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 border-2 border-white/60 text-white rounded-2xl font-semibold text-base hover:border-white hover:bg-white/10 active:scale-95 transition-all"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-[#f5f5f5] px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Todo lo que necesitas</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-[#04bcd4]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={22} className="text-[#04bcd4]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Listas organizadas</h3>
              <p className="text-sm text-[#888888]">Crea y gestiona tus listas de la compra por supermercado y fecha</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GitCompare size={22} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compara precios</h3>
              <p className="text-sm text-[#888888]">Busca en Mercadona, Alcampo, Dia, BM y Carrefour a la vez</p>
            </div>
            <button
              onClick={() => navigate('/juego')}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:border-[#04bcd4]/30 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Gamepad2 size={22} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Juego de precios</h3>
              <p className="text-sm text-[#888888]">¿Sabes cuánto cuestan tus productos? ¡Juega sin registrarte!</p>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-center py-6 text-gray-500 text-sm">
        DailyShopping · Tu compra inteligente
      </div>
    </div>
  )
}
