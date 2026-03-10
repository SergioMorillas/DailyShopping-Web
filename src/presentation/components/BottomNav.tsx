import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, GitCompare, Gamepad2, User } from 'lucide-react'

const navItems = [
  { path: '/comparar', icon: GitCompare, label: 'Comparar' },
  { path: '/listas', icon: ShoppingCart, label: 'Listas' },
  { path: '/juego', icon: Gamepad2, label: 'Juego' },
  { path: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-white rounded-full shadow-2xl shadow-black/12 flex items-center px-1.5 py-1.5 gap-0.5 border border-gray-100/80">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 ${
                active
                  ? 'bg-[#04bcd4] text-white shadow-lg shadow-[#04bcd4]/35'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold leading-none ${active ? 'text-white' : ''}`}>
                {label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
