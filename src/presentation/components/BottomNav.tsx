import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, GitCompare, Gamepad2, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/useAuthStore'

const navItems = [
  { path: '/comparar', icon: GitCompare, label: 'Comparar' },
  { path: '/listas', icon: ShoppingCart, label: 'Mis Listas' },
  { path: '/juego', icon: Gamepad2, label: 'Juego' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = pathname === path || (path === '/listas' && pathname === '/')
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                active ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
        {user && (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-gray-400 hover:text-red-500 transition-all"
            title={`Salir (${user.username})`}
          >
            <LogOut size={22} strokeWidth={1.8} />
            <span className="text-xs font-medium">Salir</span>
          </button>
        )}
      </div>
    </nav>
  )
}
