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
    useCases.obtenerListas.ejecutar().catch(() => []).then((l) => {
      setListas(l)
      setLoading(false)
    })
  }, [setListas])

  useEffect(() => {
    if (!busqueda.trim()) {
      setListasFiltradas(listas)
    } else {
      setListasFiltradas(listas.filter((l) => l.nombre.toLowerCase().includes(busqueda.toLowerCase())))
    }
  }, [listas, busqueda])

  const handleEliminar = useCallback(async (id: number) => {
    await useCases.eliminarLista.ejecutar(id)
    eliminarListaDelStore(id)
  }, [eliminarListaDelStore])

  return (
    <>
      <AppHeader
        title="Mis Listas"
        showLogo
        rightAction={
          <button onClick={() => setShowSearch(s => !s)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors">
            <Search size={22} />
          </button>
        }
      />
      <Layout>
        <div className="pt-4 pb-2">
          <p className="text-sm text-[#888888]">Hola, <span className="text-[#04bcd4] font-bold">{user?.username}</span> · {listas.length} lista{listas.length !== 1 ? 's' : ''}</p>
        </div>

        {showSearch && (
          <div className="relative mb-3">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar listas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-10 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30 shadow-sm"
            />
            {busqueda && <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16} /></button>}
          </div>
        )}

        {loading ? <LoadingSpinner /> : listasFiltradas.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={72} />}
            title={busqueda ? 'Sin resultados' : '¡Sin listas aún!'}
            description={busqueda ? `No hay listas con "${busqueda}"` : 'Crea tu primera lista pulsando el botón +'}
            action={!busqueda ? <button onClick={() => navigate('/crear')} className="bg-[#04bcd4] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#03aabf] active:scale-95 transition-all">Nueva lista</button> : undefined}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {listasFiltradas.map((lista) => <ListaCard key={lista.id} lista={lista} onEliminar={handleEliminar} />)}
          </div>
        )}

        <button
          onClick={() => navigate('/crear')}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#04bcd4] text-white rounded-full shadow-lg shadow-[#04bcd4]/40 flex items-center justify-center hover:bg-[#03aabf] active:scale-95 transition-all z-40"
        >
          <Plus size={26} />
        </button>
      </Layout>
    </>
  )
}
