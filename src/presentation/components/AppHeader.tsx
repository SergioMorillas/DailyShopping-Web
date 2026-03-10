import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Menu, ShoppingCart } from 'lucide-react'

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
    <header className="bg-[#04bcd4] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-2xl mx-auto flex items-center h-14 px-2">
        {/* Left button */}
        <button
          onClick={showBack ? handleBack : undefined}
          className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors flex-shrink-0"
        >
          {showBack ? <ArrowLeft size={24} /> : showLogo ? <ShoppingCart size={24} /> : <Menu size={24} />}
        </button>

        {/* Title */}
        <h1 className="flex-1 text-center font-bold text-lg tracking-wide truncate px-2">
          {title}
        </h1>

        {/* Right action */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
          {rightAction}
        </div>
      </div>
    </header>
  )
}
