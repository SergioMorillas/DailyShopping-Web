import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ShoppingCart, Check } from 'lucide-react'
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
    const nuevos = listaActual.productos.map((p) =>
      p.id === productoId ? p.withMarked(!p.marked) : p
    )
    guardar(listaActual.withProductos(nuevos))
  }, [listaActual, guardar])

  const handleIncrementar = useCallback((productoId: string) => {
    if (!listaActual) return
    const nuevos = listaActual.productos.map((p) =>
      p.id === productoId ? p.withAmount(p.amount + 1) : p
    )
    guardar(listaActual.withProductos(nuevos))
  }, [listaActual, guardar])

  const handleDecrementar = useCallback((productoId: string) => {
    if (!listaActual) return
    const nuevos = listaActual.productos
      .map((p) => (p.id === productoId ? p.withAmount(Math.max(0, p.amount - 1)) : p))
      .filter((p) => p.amount > 0)
    guardar(listaActual.withProductos(nuevos))
  }, [listaActual, guardar])

  if (loading) return <Layout><LoadingSpinner /></Layout>
  if (!listaActual) return <Layout><EmptyState icon={<ShoppingCart size={64} />} title="Lista no encontrada" description="Esta lista no existe o ha sido eliminada" /></Layout>

  const marcados = listaActual.productos.filter((p) => p.marked).length
  const total = listaActual.productos.length

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 pt-6 pb-4 -mx-4 px-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-gray-900 truncate">{listaActual.nombre}</h1>
            <p className="text-xs text-gray-500">{listaActual.supermercado} · {listaActual.fechaFormateada}</p>
          </div>
          <button
            onClick={() => navigate(`/lista/${id}/buscar`)}
            className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex-shrink-0"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Resumen de precios */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="font-bold text-gray-900 text-base">{listaActual.precioTotal.toFixed(2)} €</p>
          </div>
          <div className="bg-primary-50 rounded-xl p-3 text-center border border-primary-100">
            <p className="text-xs text-primary-600 mb-0.5 flex items-center justify-center gap-0.5">
              <Check size={10} /> Marcado
            </p>
            <p className="font-bold text-primary-700 text-base">{listaActual.precioMarcado.toFixed(2)} €</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
            <p className="text-xs text-amber-600 mb-0.5">Pendiente</p>
            <p className="font-bold text-amber-700 text-base">{listaActual.precioSinMarcar.toFixed(2)} €</p>
          </div>
        </div>

        {/* Progreso */}
        {total > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{marcados} de {total} artículos</span>
              <span>{Math.round((marcados / total) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${(marcados / total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {listaActual.productos.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={64} />}
          title="Lista vacía"
          description="Añade productos desde el buscador pulsando el botón +"
          action={
            <button
              onClick={() => navigate(`/lista/${id}/buscar`)}
              className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-primary-700 active:scale-95 transition-all"
            >
              Buscar productos
            </button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Pendientes */}
          {listaActual.productos.filter((p) => !p.marked).map((p) => (
            <ProductoCard
              key={p.id}
              producto={p}
              modo="lista"
              onToggleMarked={handleToggleMarked}
              onIncrementar={handleIncrementar}
              onDecrementar={handleDecrementar}
            />
          ))}
          {/* Marcados */}
          {listaActual.productos.filter((p) => p.marked).length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">Ya en el carro</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              {listaActual.productos.filter((p) => p.marked).map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  modo="lista"
                  onToggleMarked={handleToggleMarked}
                  onIncrementar={handleIncrementar}
                  onDecrementar={handleDecrementar}
                />
              ))}
            </>
          )}
        </div>
      )}
    </Layout>
  )
}
