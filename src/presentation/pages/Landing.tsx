import { useNavigate } from 'react-router-dom'
import { ShoppingCart, GitCompare, Gamepad2, ChevronRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'
import { useEffect } from 'react'

export function Landing() {
  const navigate = useNavigate()
  const token = useAuthStore(s => s.token)

  useEffect(() => {
    if (token) navigate('/listas', { replace: true })
  }, [token, navigate])

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Hero */}
      <div className="relative flex-shrink-0" style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0280a0 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full bg-white/8" />

        <div className="relative max-w-2xl mx-auto px-6 pt-16 pb-20 text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
              <ShoppingCart size={22} className="text-white" />
            </div>
            <span className="font-black text-white/90 tracking-tight text-lg">DailyShopping</span>
          </div>

          <h1 className="text-[42px] font-black leading-[1.05] tracking-tight mb-4">
            Tu compra,<br />
            <span className="text-white/80">inteligente.</span>
          </h1>

          <p className="text-white/75 text-base font-medium leading-relaxed mb-10 max-w-sm">
            Listas de la compra con precios reales. Busca en Mercadona, Alcampo, Dia y BM.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/registro')}
              className="flex-1 py-4 bg-white text-[#04bcd4] rounded-2xl font-black text-sm hover:bg-white/95 active:scale-95 transition-all shadow-xl shadow-black/15 flex items-center justify-center gap-2">
              Crear cuenta <ChevronRight size={16} />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="py-4 px-6 border-2 border-white/40 text-white rounded-2xl font-black text-sm hover:border-white/70 hover:bg-white/10 active:scale-95 transition-all">
              Entrar
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 bg-white px-4 pt-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-[#04bcd4]" />
            <span className="text-xs font-black text-[#04bcd4] uppercase tracking-widest">Funcionalidades</span>
          </div>

          <div className="space-y-3">
            {[
              {
                icon: ShoppingCart,
                color: '#04bcd4',
                title: 'Listas personales',
                desc: 'Organiza tus listas por supermercado y fecha. Marca artículos al vuelo mientras compras.',
                action: undefined as (() => void) | undefined,
                actionLabel: undefined as string | undefined,
              },
              {
                icon: GitCompare,
                color: '#0066cc',
                title: 'Comparador de precios',
                desc: 'Busca cualquier producto y ve el precio en todos los supermercados a la vez.',
                action: undefined as (() => void) | undefined,
                actionLabel: undefined as string | undefined,
              },
              {
                icon: Gamepad2,
                color: '#7c3aed',
                title: 'Juego de precios',
                desc: '¿Sabes cuánto cuesta la leche en Mercadona? Ponlo a prueba. Sin cuenta.',
                action: () => navigate('/juego'),
                actionLabel: 'Jugar ahora',
              },
            ].map(({ icon: Icon, color, title, desc, action, actionLabel }) => (
              <div key={title} className="bg-gray-50 rounded-3xl p-5 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{desc}</p>
                  {action && (
                    <button onClick={action}
                      className="mt-2 text-xs font-black flex items-center gap-1 hover:gap-2 transition-all"
                      style={{ color }}>
                      {actionLabel} <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 text-center py-5 text-xs text-gray-400 font-medium">
        DailyShopping · Hecho para comprar mejor
      </div>
    </div>
  )
}
