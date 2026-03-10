import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, GitCompare, Gamepad2, User } from 'lucide-react'

const navItems = [
  { path: '/comparar', icon: GitCompare, label: 'Comparar' },
  { path: '/listas', icon: ShoppingCart, label: 'Mis Listas' },
  { path: '/juego', icon: Gamepad2, label: 'Juego' },
  { path: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#04bcd4]/20 safe-bottom shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all ${
                active ? 'text-[#04bcd4]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={23} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-semibold">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
