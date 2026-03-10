export function LoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-10 h-10 border-4 border-[#04bcd4]/20 border-t-[#04bcd4] rounded-full animate-spin" />
      <p className="text-sm text-[#888888] font-medium">{text}</p>
    </div>
  )
}
