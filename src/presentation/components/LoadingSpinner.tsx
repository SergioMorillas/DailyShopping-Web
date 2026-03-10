export function LoadingSpinner({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-[#04bcd4]/15" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#04bcd4] animate-spin" />
      </div>
      <p className="text-sm text-gray-400 font-semibold tracking-wide">{text}</p>
    </div>
  )
}
