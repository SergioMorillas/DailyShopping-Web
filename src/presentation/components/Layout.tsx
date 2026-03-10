import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
  hideNav?: boolean
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 pb-28">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
