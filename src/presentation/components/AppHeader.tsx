import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

interface AppHeaderProps {
  title: string
  onBack?: () => void
  showBack?: boolean
  rightAction?: ReactNode
  showLogo?: boolean
}

export function AppHeader({ title, onBack, showBack = false, rightAction, showLogo = false }: AppHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <header className="sticky top-0 z-50 shadow-md shadow-[#04bcd4]/15"
      style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0397aa 100%)' }}>
      <div className="max-w-2xl mx-auto flex items-center h-14 px-2 gap-2">
        <button
          onClick={showBack ? handleBack : undefined}
          className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-all active:scale-95 flex-shrink-0"
        >
          {showBack ? (
            <ArrowLeft size={22} />
          ) : showLogo ? (
            <ShoppingCart size={22} />
          ) : (
            <div className="w-7 h-7 flex flex-col justify-center gap-1.5">
              <span className="block h-0.5 w-5 bg-white rounded-full" />
              <span className="block h-0.5 w-3.5 bg-white/70 rounded-full" />
            </div>
          )}
        </button>

        <h1 className="flex-1 text-center font-black text-white text-base tracking-tight truncate px-1">
          {title}
        </h1>

        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
