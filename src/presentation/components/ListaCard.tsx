import { ListaCompra } from '../../domain/entities/ListaCompra'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronRight, ShoppingBag, Calendar } from 'lucide-react'
import { SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'

interface ListaCardProps {
  lista: ListaCompra
  onEliminar: (id: number) => void
}

export function ListaCard({ lista, onEliminar }: ListaCardProps) {
  const navigate = useNavigate()
  const color = SUPERMERCADO_COLORES[lista.supermercado] ?? '#04bcd4'

  return (
    <div
      className="bg-white rounded-2xl shadow-sm overflow-hidden active:scale-[0.99] transition-all"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <button
        className="w-full text-left p-4 pr-2"
        onClick={() => navigate(`/lista/${lista.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={14} className="text-[#04bcd4] flex-shrink-0" />
              <span className="text-xs font-bold text-[#04bcd4] uppercase tracking-wider truncate">
                {lista.supermercado}
              </span>
            </div>
            <p className="font-bold text-gray-900 text-base leading-tight truncate">{lista.nombre}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Calendar size={12} className="text-[#888888]" />
              <span className="text-xs text-[#888888]">{lista.fechaFormateada}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-xl font-bold text-gray-900">{lista.precioTotal.toFixed(2)} €</span>
            <span className="text-xs text-[#888888]">{lista.cantidadProductos} art.</span>
          </div>
        </div>
      </button>

      {/* Actions row */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => lista.id && onEliminar(lista.id)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors text-xs font-semibold"
        >
          <Trash2 size={15} />
          Eliminar
        </button>
        <div className="w-px bg-gray-100" />
        <button
          onClick={() => navigate(`/lista/${lista.id}`)}
          className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[#04bcd4] hover:bg-[#04bcd4]/5 active:bg-[#04bcd4]/10 transition-colors text-xs font-semibold"
        >
          Ver lista
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
