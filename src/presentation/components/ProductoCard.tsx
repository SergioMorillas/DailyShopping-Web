import { Producto } from '../../domain/entities/Producto'
import { Plus, Minus, Check, ShoppingCart } from 'lucide-react'

interface ProductoCardProps {
  producto: Producto
  onAgregar?: (producto: Producto) => void
  onToggleMarked?: (id: string) => void
  onIncrementar?: (id: string) => void
  onDecrementar?: (id: string) => void
  onEliminar?: (id: string) => void
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
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3 transition-all ${
        modo === 'lista' && producto.marked ? 'opacity-60' : ''
      }`}
    >
      {/* Imagen */}
      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {producto.image ? (
          <img
            src={producto.image}
            alt={producto.name}
            className="w-full h-full object-contain"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={20} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-medium text-sm text-gray-900 leading-snug line-clamp-2 ${
            modo === 'lista' && producto.marked ? 'line-through text-gray-400' : ''
          }`}
        >
          {producto.name}
        </h4>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className="text-lg font-bold text-primary-600">
            {producto.price.toFixed(2)} €
          </span>
          {producto.hasPricePerKilo && (
            <span className="text-xs text-gray-400">
              {producto.pricePerKilo.toFixed(2)} €/kg
            </span>
          )}
          {modo === 'comparador' && producto.supermercado && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
              {producto.supermercado}
            </span>
          )}
        </div>

        {modo === 'lista' && (
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onDecrementar?.(producto.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold w-5 text-center">{producto.amount}</span>
            <button
              onClick={() => onIncrementar?.(producto.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              <Plus size={14} />
            </button>
            <span className="text-xs text-gray-400 ml-1">
              = {producto.precioTotal.toFixed(2)} €
            </span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        {modo === 'busqueda' && (
          <button
            onClick={() => onAgregar?.(producto)}
            className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:scale-95 transition-all"
          >
            <Plus size={18} />
          </button>
        )}

        {modo === 'lista' && (
          <button
            onClick={() => onToggleMarked?.(producto.id)}
            className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
              producto.marked
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-300 text-transparent hover:border-primary-400'
            }`}
          >
            <Check size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
