import { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
  children: ReactNode
  hideNav?: boolean
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-24">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
