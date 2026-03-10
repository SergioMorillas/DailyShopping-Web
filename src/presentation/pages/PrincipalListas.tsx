import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, X, ShoppingBag } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
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
  const [showSearch, setShowSearch] = useState(false)
  const [listasFiltradas, setListasFiltradas] = useState<ListaCompra[]>([])

  useEffect(() => {
    useCases.obtenerListas.ejecutar().catch(() => []).then(l => {
      setListas(l)
      setLoading(false)
    })
  }, [setListas])

  useEffect(() => {
    if (!busqueda.trim()) { setListasFiltradas(listas); return }
    setListasFiltradas(listas.filter(l => l.nombre.toLowerCase().includes(busqueda.toLowerCase())))
  }, [listas, busqueda])

  const handleEliminar = useCallback(async (id: number) => {
    await useCases.eliminarLista.ejecutar(id)
    eliminarListaDelStore(id)
  }, [eliminarListaDelStore])

  return (
    <>
      <AppHeader
        title="DailyShopping"
        showLogo
        rightAction={
          <button onClick={() => setShowSearch(s => !s)}
            className="w-10 h-10 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-all">
            <Search size={21} />
          </button>
        }
      />
      <Layout>
        {/* Greeting */}
        <div className="pt-5 pb-4">
          <p className="text-[13px] font-semibold text-[#04bcd4] tracking-wide uppercase mb-0.5">Mis listas</p>
          <h2 className="text-2xl font-black text-gray-900">
            Hola, {user?.username}
          </h2>
          <p className="text-sm text-gray-400 font-medium mt-0.5">
            {listas.length === 0 ? 'Aún no tienes listas' :
             listas.length === 1 ? '1 lista guardada' :
             `${listas.length} listas guardadas`}
          </p>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en mis listas..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              autoFocus
              className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/25 shadow-sm"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? <LoadingSpinner /> :
          listasFiltradas.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={64} />}
              title={busqueda ? 'Sin resultados' : 'Empieza aquí'}
              description={busqueda ? `No hay listas con "${busqueda}"` : 'Crea tu primera lista de la compra'}
              action={!busqueda && (
                <button onClick={() => navigate('/crear')}
                  className="bg-[#04bcd4] text-white px-8 py-3.5 rounded-full font-black text-sm hover:bg-[#0397aa] active:scale-95 transition-all shadow-lg shadow-[#04bcd4]/30">
                  Crear lista
                </button>
              )}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {listasFiltradas.map(lista => (
                <ListaCard key={lista.id} lista={lista} onEliminar={handleEliminar} />
              ))}
            </div>
          )
        }

        {/* FAB */}
        <button
          onClick={() => navigate('/crear')}
          className="fixed bottom-24 right-4 w-14 h-14 bg-[#04bcd4] text-white rounded-full shadow-xl shadow-[#04bcd4]/40 flex items-center justify-center hover:bg-[#0397aa] active:scale-95 transition-all z-40">
          <Plus size={26} />
        </button>
      </Layout>
    </>
  )
}
