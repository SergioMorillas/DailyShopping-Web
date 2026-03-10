import { Producto } from '../../domain/entities/Producto'
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react'

interface ProductoCardProps {
  producto: Producto
  onAgregar?: (producto: Producto) => void
  onToggleMarked?: (id: string) => void
  onIncrementar?: (id: string) => void
  onDecrementar?: (id: string) => void
  modo?: 'busqueda' | 'lista' | 'comparador'
}

export function ProductoCard({
  producto,
  onAgregar,
  onToggleMarked,
  onIncrementar,
  onDecrementar,
  modo = 'busqueda',
}: ProductoCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm flex items-stretch overflow-hidden transition-opacity ${modo === 'lista' && producto.marked ? 'opacity-55' : ''}`}>
      {/* Imagen — left column */}
      <div className="w-20 h-20 flex-shrink-0 bg-gray-50 flex items-center justify-center border-r border-gray-100">
        {producto.image ? (
          <img
            src={producto.image}
            alt={producto.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <ShoppingCart size={24} className="text-gray-300" />
        )}
      </div>

      {/* Info — center column */}
      <div className="flex-1 px-3 py-2.5 min-w-0 flex flex-col justify-center">
        <p className={`font-semibold text-sm text-gray-900 leading-snug line-clamp-2 ${modo === 'lista' && producto.marked ? 'line-through text-gray-400' : ''}`}>
          {producto.name}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="font-bold text-base text-[#04bcd4]">{producto.price.toFixed(2)} €</span>
          {producto.hasPricePerKilo && (
            <span className="text-xs text-[#888888]">{producto.pricePerKilo.toFixed(2)} €/kg</span>
          )}
          {modo === 'comparador' && producto.supermercado && (
            <span className="text-xs px-2 py-0.5 bg-[#04bcd4]/10 text-[#04bcd4] rounded-full font-semibold">
              {producto.supermercado}
            </span>
          )}
        </div>
        {modo === 'lista' && (
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => onDecrementar?.(producto.id)}
              className="w-6 h-6 rounded-full bg-[#04bcd4] text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <Minus size={12} />
            </button>
            <span className="text-sm font-bold w-5 text-center text-gray-900">{producto.amount}</span>
            <button
              onClick={() => onIncrementar?.(producto.id)}
              className="w-6 h-6 rounded-full bg-[#04bcd4] text-white flex items-center justify-center active:scale-90 transition-transform"
            >
              <Plus size={12} />
            </button>
            <span className="text-xs text-[#888888] ml-1">= {producto.precioTotal.toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Action — right column */}
      <div className="flex items-center justify-center px-2 border-l border-gray-100 flex-shrink-0">
        {modo === 'busqueda' && (
          <button
            onClick={() => onAgregar?.(producto)}
            className="w-9 h-9 rounded-full bg-[#04bcd4] text-white flex items-center justify-center hover:bg-[#03aabf] active:scale-90 transition-all shadow-sm shadow-[#04bcd4]/30"
          >
            <Plus size={20} />
          </button>
        )}
        {modo === 'lista' && (
          <button
            onClick={() => onToggleMarked?.(producto.id)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              producto.marked
                ? 'bg-[#04bcd4] border-[#04bcd4] text-white'
                : 'border-gray-300 text-transparent hover:border-[#04bcd4]'
            }`}
          >
            <Check size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
