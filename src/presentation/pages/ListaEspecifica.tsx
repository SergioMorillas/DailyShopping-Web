import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ShoppingCart, Check } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Layout } from '../components/Layout'
import { ProductoCard } from '../components/ProductoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { useCases } from '../../container'
import { ListaCompra } from '../../domain/entities/ListaCompra'

export function ListaEspecifica() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { listaActual, setListaActual, actualizarListaEnStore } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    useCases.obtenerListaPorId.ejecutar(Number(id)).then((l) => {
      setListaActual(l)
      setLoading(false)
    })
    return () => { setListaActual(null) }
  }, [id, setListaActual])

  const guardar = useCallback(async (lista: ListaCompra) => {
    const actualizada = await useCases.actualizarLista.ejecutar(lista)
    actualizarListaEnStore(actualizada)
    setListaActual(actualizada)
  }, [actualizarListaEnStore, setListaActual])

  const handleToggleMarked = useCallback((productoId: string) => {
    if (!listaActual) return
    guardar(listaActual.withProductos(listaActual.productos.map(p => p.id === productoId ? p.withMarked(!p.marked) : p)))
  }, [listaActual, guardar])

  const handleIncrementar = useCallback((productoId: string) => {
    if (!listaActual) return
    guardar(listaActual.withProductos(listaActual.productos.map(p => p.id === productoId ? p.withAmount(p.amount + 1) : p)))
  }, [listaActual, guardar])

  const handleDecrementar = useCallback((productoId: string) => {
    if (!listaActual) return
    guardar(listaActual.withProductos(
      listaActual.productos.map(p => p.id === productoId ? p.withAmount(Math.max(0, p.amount - 1)) : p).filter(p => p.amount > 0)
    ))
  }, [listaActual, guardar])

  if (loading) return (
    <>
      <AppHeader title="..." showBack onBack={() => navigate('/listas')} />
      <Layout><LoadingSpinner /></Layout>
    </>
  )

  if (!listaActual) return (
    <>
      <AppHeader title="Lista no encontrada" showBack onBack={() => navigate('/listas')} />
      <Layout><EmptyState icon={<ShoppingCart size={64} />} title="Lista no encontrada" description="Esta lista no existe" /></Layout>
    </>
  )

  const marcados = listaActual.productos.filter(p => p.marked).length
  const total = listaActual.productos.length

  return (
    <>
      <AppHeader
        title={listaActual.nombre}
        showBack
        onBack={() => navigate('/listas')}
        rightAction={
          <button
            onClick={() => navigate(`/lista/${id}/buscar`)}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <Plus size={24} />
          </button>
        }
      />

      {/* Stats strip — polished gradient */}
      <div style={{ background: 'linear-gradient(135deg, #04bcd4 0%, #0397aa 100%)' }}
        className="shadow-md shadow-[#04bcd4]/20">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-4 divide-x divide-white/20">
            {[
              { label: 'Media', value: listaActual.precioPromedio.toFixed(2) },
              { label: 'Pendiente', value: listaActual.precioSinMarcar.toFixed(2) },
              { label: 'En carro', value: listaActual.precioMarcado.toFixed(2) },
              { label: 'Total', value: listaActual.precioTotal.toFixed(2) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center py-3 px-1">
                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-0.5">{label}</span>
                <span className="price-display text-base font-black text-white leading-none">{value} €</span>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="px-4 pb-3">
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${(marcados / total) * 100}%` }} />
              </div>
              <p className="text-[10px] text-white/70 font-semibold text-center mt-1.5">
                {marcados} de {total} · {Math.round((marcados / total) * 100)}% completado
              </p>
            </div>
          )}
        </div>
      </div>

      <Layout>
        <div className="pt-3">
          {listaActual.productos.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart size={64} />}
              title="Lista vacía"
              description="Añade productos pulsando el botón +"
              action={
                <button onClick={() => navigate(`/lista/${id}/buscar`)} className="bg-[#04bcd4] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#03aabf] active:scale-95 transition-all">
                  Buscar productos
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {listaActual.productos.filter(p => !p.marked).map(p => (
                <ProductoCard key={p.id} producto={p} modo="lista" onToggleMarked={handleToggleMarked} onIncrementar={handleIncrementar} onDecrementar={handleDecrementar} />
              ))}
              {listaActual.productos.filter(p => p.marked).length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-3 mb-1">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="text-xs text-[#888888] font-semibold flex items-center gap-1"><Check size={12} /> Ya en el carro</span>
                    <div className="h-px flex-1 bg-gray-300" />
                  </div>
                  {listaActual.productos.filter(p => p.marked).map(p => (
                    <ProductoCard key={p.id} producto={p} modo="lista" onToggleMarked={handleToggleMarked} onIncrementar={handleIncrementar} onDecrementar={handleDecrementar} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
