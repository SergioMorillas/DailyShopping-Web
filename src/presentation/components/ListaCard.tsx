import { ListaCompra } from '../../domain/entities/ListaCompra'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronRight } from 'lucide-react'
import { SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'

interface ListaCardProps {
  lista: ListaCompra
  onEliminar: (id: number) => void
}

export function ListaCard({ lista, onEliminar }: ListaCardProps) {
  const navigate = useNavigate()
  const color = SUPERMERCADO_COLORES[lista.supermercado] ?? '#04bcd4'

  return (
    <div className="bg-white rounded-3xl overflow-hidden hover:shadow-md transition-all duration-200 active:scale-[0.99]"
      style={{ boxShadow: `0 2px 12px ${color}18` }}>

      {/* Supermarket color strip */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

      <button className="w-full text-left p-4 pb-3" onClick={() => navigate(`/lista/${lista.id}`)}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Supermarket badge */}
            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
              style={{ backgroundColor: `${color}18`, color }}>
              {lista.supermercado}
            </span>
            {/* Name */}
            <h3 className="font-extrabold text-gray-900 text-[17px] leading-snug truncate pr-2">
              {lista.nombre}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">{lista.fechaFormateada}</p>
          </div>

          {/* Price block */}
          <div className="text-right flex-shrink-0">
            <div className="price-display">
              <span className="text-2xl font-black text-gray-900 leading-none">{lista.precioTotal.toFixed(2)}</span>
              <span className="text-base font-bold text-gray-400"> €</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {lista.cantidadProductos} artículo{lista.cantidadProductos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </button>

      {/* Actions */}
      <div className="flex divide-x divide-gray-100 border-t border-gray-100">
        <button
          onClick={() => lista.id && onEliminar(lista.id)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors"
        >
          <Trash2 size={13} /> Eliminar
        </button>
        <button
          onClick={() => navigate(`/lista/${lista.id}`)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-bold hover:bg-[#04bcd4]/5 transition-colors"
          style={{ color: '#04bcd4' }}
        >
          Abrir lista <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
