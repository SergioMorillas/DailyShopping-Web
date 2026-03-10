import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, PackagePlus, Check } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Layout } from '../components/Layout'
import { ProductoCard } from '../components/ProductoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useAppStore } from '../store/useAppStore'
import { useCases } from '../../container'
import { Producto } from '../../domain/entities/Producto'
import { ListaCompra } from '../../domain/entities/ListaCompra'
import { SupermercadoDisponible } from '../../domain/entities/SupermercadoDisponible'

export function BuscadorProductos() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { listaActual: listaDelStore, actualizarListaEnStore } = useAppStore()
  const [lista, setLista] = useState<ListaCompra | null>(listaDelStore)
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)
  const [error, setError] = useState('')
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customNombre, setCustomNombre] = useState('')
  const [customPrecio, setCustomPrecio] = useState('')
  const [customAdded, setCustomAdded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (listaDelStore) {
      setLista(listaDelStore)
    } else if (id) {
      useCases.obtenerListaPorId.ejecutar(Number(id)).then(setLista)
    }
  }, [id, listaDelStore])

  const agregarProducto = useCallback(async (producto: Producto) => {
    if (!lista) return
    const existe = lista.productos.find((p) => p.id === producto.id)
    const nuevos = existe
      ? lista.productos.map((p) => p.id === producto.id ? p.withAmount(p.amount + 1) : p)
      : [...lista.productos, producto]
    const actualizada = lista.withProductos(nuevos)
    await useCases.actualizarLista.ejecutar(actualizada)
    actualizarListaEnStore(actualizada)
    setLista(actualizada)
  }, [lista, actualizarListaEnStore])

  const buscar = useCallback(async () => {
    if (!query.trim() || !lista) return
    setLoading(true)
    setError('')
    setBuscado(true)
    setShowCustomForm(false)
    setCustomAdded(false)
    try {
      const productos = await useCases.buscarProductos.ejecutar(
        query.trim(),
        lista.supermercado as SupermercadoDisponible
      )
      setResultados(productos)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(`Error al buscar en ${lista.supermercado}: ${msg}`)
      setResultados([])
    } finally {
      setLoading(false)
    }
  }, [query, lista])

  const handleAgregarPersonalizado = useCallback(async () => {
    if (!customNombre.trim() || !customPrecio) return
    const precio = parseFloat(customPrecio.replace(',', '.'))
    if (isNaN(precio) || precio < 0) return
    const productoCustom = new Producto({
      id: `custom-${Date.now()}`,
      name: customNombre.trim(),
      image: '',
      price: precio,
      pricePerKilo: -1,
      mass: -1,
      amount: 1,
      marked: false,
    })
    await agregarProducto(productoCustom)
    setCustomNombre('')
    setCustomPrecio('')
    setShowCustomForm(false)
    setCustomAdded(true)
    setTimeout(() => setCustomAdded(false), 2500)
  }, [customNombre, customPrecio, agregarProducto])

  const sinResultados = buscado && !loading && resultados.length === 0 && !error

  return (
    <>
      <AppHeader
        title={lista ? `${lista.supermercado}` : 'Buscar productos'}
        showBack
        onBack={() => navigate(`/lista/${id}`)}
      />
      <Layout>
        <div className="pt-4 pb-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar producto..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscar()}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30 shadow-sm transition-all"
                autoFocus
              />
            </div>
            <button
              onClick={buscar}
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-[#04bcd4] text-white rounded-2xl font-bold hover:bg-[#03aabf] active:scale-95 disabled:opacity-60 transition-all"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Toast de producto añadido */}
        {customAdded && (
          <div className="flex items-center gap-2 bg-[#04bcd4] text-white px-4 py-3 rounded-2xl mb-4 animate-pulse">
            <Check size={18} />
            <span className="text-sm font-medium">Producto personalizado añadido</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Buscando productos..." />
        ) : error ? (
          <div className="flex flex-col gap-4">
            <EmptyState
              icon={<Search size={64} />}
              title="Error de búsqueda"
              description={error}
              action={
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl font-medium hover:border-[#04bcd4] hover:text-[#04bcd4] transition-all"
                >
                  <PackagePlus size={18} />
                  Añadir manualmente
                </button>
              }
            />
            {showCustomForm && <CustomProductForm
              nombre={customNombre}
              precio={customPrecio}
              onNombreChange={setCustomNombre}
              onPrecioChange={setCustomPrecio}
              onSubmit={handleAgregarPersonalizado}
              onCancel={() => setShowCustomForm(false)}
            />}
          </div>
        ) : sinResultados ? (
          <div className="flex flex-col gap-4">
            <EmptyState
              icon={<Search size={64} />}
              title="Sin resultados"
              description={`No se encontró "${query}" en ${lista?.supermercado}`}
              action={
                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl font-medium hover:border-[#04bcd4] hover:text-[#04bcd4] transition-all"
                >
                  <PackagePlus size={18} />
                  Añadir manualmente
                </button>
              }
            />
            {showCustomForm && <CustomProductForm
              nombre={customNombre}
              precio={customPrecio}
              onNombreChange={setCustomNombre}
              onPrecioChange={setCustomPrecio}
              onSubmit={handleAgregarPersonalizado}
              onCancel={() => setShowCustomForm(false)}
            />}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {resultados.map((p) => (
              <ProductoCard key={p.id} producto={p} modo="busqueda" onAgregar={agregarProducto} />
            ))}
          </div>
        )}
      </Layout>
    </>
  )
}

interface CustomProductFormProps {
  nombre: string
  precio: string
  onNombreChange: (v: string) => void
  onPrecioChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
}

function CustomProductForm({ nombre, precio, onNombreChange, onPrecioChange, onSubmit, onCancel }: CustomProductFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#04bcd4]/30 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <PackagePlus size={18} className="text-[#04bcd4]" />
        <h3 className="font-semibold text-gray-900">Producto personalizado</h3>
      </div>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/20 transition-all"
          autoFocus
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">€</span>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={precio}
            onChange={(e) => onPrecioChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={!nombre.trim() || !precio}
            className="flex-1 py-3 bg-[#04bcd4] text-white rounded-xl text-sm font-medium hover:bg-[#03aabf] disabled:opacity-50 transition-all"
          >
            Añadir a la lista
          </button>
        </div>
      </div>
    </div>
  )
}
