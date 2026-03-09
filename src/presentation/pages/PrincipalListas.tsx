import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, ShoppingBag } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ListaCard } from '../components/ListaCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { useAuthStore } from '../store/useAuthStore'
import { useCases } from '../../container'
import { ListaCompra } from '../../domain/entities/ListaCompra'

export function PrincipalListas() {
  const navigate = useNavigate()
  const { listas, setListas, eliminarListaDelStore } = useAppStore()
  const user = useAuthStore(s => s.user)
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [listasFiltradas, setListasFiltradas] = useState<ListaCompra[]>([])

  useEffect(() => {
    useCases.obtenerListas.ejecutar().catch(() => []).then((l) => {
      setListas(l)
      setLoading(false)
    })
  }, [setListas])

  useEffect(() => {
    if (!busqueda.trim()) {
      setListasFiltradas(listas)
    } else {
      const q = busqueda.toLowerCase()
      setListasFiltradas(listas.filter((l) => l.nombre.toLowerCase().includes(q)))
    }
  }, [listas, busqueda])

  const handleEliminar = useCallback(
    async (id: number) => {
      await useCases.eliminarLista.ejecutar(id)
      eliminarListaDelStore(id)
    },
    [eliminarListaDelStore]
  )

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 pt-8 pb-4 -mx-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Listas</h1>
            <p className="text-sm text-gray-500">Hola, {user?.username} · {listas.length} lista{listas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar listas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : listasFiltradas.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={64} />}
          title={busqueda ? 'Sin resultados' : '¡Sin listas aún!'}
          description={
            busqueda
              ? `No hay listas que coincidan con "${busqueda}"`
              : 'Crea tu primera lista de la compra pulsando el botón +'
          }
          action={
            !busqueda && (
              <button
                onClick={() => navigate('/crear')}
                className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-primary-700 active:scale-95 transition-all"
              >
                Crear lista
              </button>
            )
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {listasFiltradas.map((lista) => (
            <ListaCard key={lista.id} lista={lista} onEliminar={handleEliminar} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/crear')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all z-40"
      >
        <Plus size={24} />
      </button>
    </Layout>
  )
}
