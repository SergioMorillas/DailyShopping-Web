import { Producto } from '../../domain/entities/Producto'
import { Plus, Minus, Check, Package } from 'lucide-react'

interface ProductoCardProps {
  producto: Producto
  onAgregar?: (producto: Producto) => void
  onToggleMarked?: (id: string) => void
  onIncrementar?: (id: string) => void
  onDecrementar?: (id: string) => void
  modo?: 'busqueda' | 'lista' | 'comparador'
}

export function ProductoCard({
  producto, onAgregar, onToggleMarked, onIncrementar, onDecrementar, modo = 'busqueda',
}: ProductoCardProps) {
  const marked = modo === 'lista' && producto.marked

  return (
    <div className={`bg-white rounded-2xl flex items-stretch overflow-hidden transition-all duration-150 ${
      marked ? 'opacity-50' : 'hover:shadow-md'
    }`} style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>

      {/* Image */}
      <div className="w-[72px] flex-shrink-0 flex items-center justify-center bg-gray-50/80 p-1.5">
        {producto.image ? (
          <img src={producto.image} alt={producto.name}
            className={`w-full h-full object-contain ${marked ? 'grayscale' : ''}`}
            loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <Package size={22} className="text-gray-200" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 px-3 py-2.5 min-w-0 flex flex-col justify-center">
        <p className={`font-semibold text-[13px] leading-snug line-clamp-2 ${
          marked ? 'line-through text-gray-400' : 'text-gray-900'
        }`}>{producto.name}</p>

        <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
          <span className="price-display font-black text-lg leading-none text-[#04bcd4]">
            {producto.price.toFixed(2)} €
          </span>
          {producto.hasPricePerKilo && (
            <span className="text-[11px] text-gray-400 font-medium">
              {producto.pricePerKilo.toFixed(2)} €/kg
            </span>
          )}
          {modo === 'comparador' && producto.supermercado && (
            <span className="text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${getSuperColor(producto.supermercado)}18`,
                color: getSuperColor(producto.supermercado)
              }}>
              {producto.supermercado}
            </span>
          )}
        </div>

        {modo === 'lista' && (
          <div className="flex items-center gap-1.5 mt-2">
            <button onClick={() => onDecrementar?.(producto.id)}
              className="w-6 h-6 rounded-full bg-[#04bcd4] text-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
              <Minus size={11} />
            </button>
            <span className="text-sm font-black w-5 text-center tabular-nums text-gray-900">{producto.amount}</span>
            <button onClick={() => onIncrementar?.(producto.id)}
              className="w-6 h-6 rounded-full bg-[#04bcd4] text-white flex items-center justify-center active:scale-90 transition-transform shadow-sm">
              <Plus size={11} />
            </button>
            <span className="text-xs text-gray-400 font-medium ml-0.5 price-display">
              {producto.precioTotal.toFixed(2)} €
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center justify-center px-3 flex-shrink-0">
        {modo === 'busqueda' && (
          <button onClick={() => onAgregar?.(producto)}
            className="w-9 h-9 rounded-full bg-[#04bcd4] text-white flex items-center justify-center hover:bg-[#0397aa] active:scale-90 transition-all shadow-md shadow-[#04bcd4]/30">
            <Plus size={19} />
          </button>
        )}
        {modo === 'lista' && (
          <button onClick={() => onToggleMarked?.(producto.id)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              producto.marked
                ? 'bg-[#04bcd4] border-[#04bcd4] text-white shadow-md shadow-[#04bcd4]/25'
                : 'border-gray-200 text-transparent hover:border-[#04bcd4]/50'
            }`}>
            <Check size={17} />
          </button>
        )}
      </div>
    </div>
  )
}

function getSuperColor(nombre: string): string {
  const colors: Record<string, string> = {
    Mercadona: '#00834e', Alcampo: '#e30613', Dia: '#e3000f', BM: '#0066cc',
  }
  return colors[nombre] ?? '#04bcd4'
}
