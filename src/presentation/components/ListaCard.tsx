import { ListaCompra } from '../../domain/entities/ListaCompra'
import { useNavigate } from 'react-router-dom'
import { Trash2, ChevronRight, ShoppingBag } from 'lucide-react'
import { SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'

interface ListaCardProps {
  lista: ListaCompra
  onEliminar: (id: number) => void
}

export function ListaCard({ lista, onEliminar }: ListaCardProps) {
  const navigate = useNavigate()
  const color = SUPERMERCADO_COLORES[lista.supermercado] ?? '#059669'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: color }}
      />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            className="flex-1 text-left"
            onClick={() => navigate(`/lista/${lista.id}`)}
          >
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={16} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {lista.supermercado}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-base leading-snug">{lista.nombre}</h3>
            <p className="text-xs text-gray-400 mt-1">{lista.fechaFormateada}</p>

            <div className="flex items-center gap-4 mt-3">
              <div>
                <span className="text-xl font-bold text-gray-900">
                  {lista.precioTotal.toFixed(2)} €
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{lista.cantidadProductos} artículos</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => lista.id && onEliminar(lista.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => navigate(`/lista/${lista.id}`)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
