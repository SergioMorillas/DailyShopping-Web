import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
      <div className="text-[#04bcd4]/30">{icon}</div>
      <div>
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        <p className="text-sm text-[#888888] mt-1 max-w-xs">{description}</p>
      </div>
      {action}
    </div>
  )
}
