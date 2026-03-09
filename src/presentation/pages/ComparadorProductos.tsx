import { useState, useCallback } from 'react'
import { Search, GitCompare } from 'lucide-react'
import { Layout } from '../components/Layout'
import { ProductoCard } from '../components/ProductoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'
import { useCases } from '../../container'
import { ResultadoComparacion } from '../../application/usecases/producto/CompararPrecios'
import { SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'

export function ComparadorProductos() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<ResultadoComparacion[]>([])
  const [loading, setLoading] = useState(false)
  const [buscado, setBuscado] = useState(false)

  const comparar = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setBuscado(true)
    try {
      const res = await useCases.compararPrecios.ejecutar(query.trim())
      setResultados(res)
    } finally {
      setLoading(false)
    }
  }, [query])

  const hayResultados = resultados.some((r) => r.productos.length > 0)

  return (
    <Layout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 pt-8 pb-4 -mx-4 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Comparar precios</h1>
        <p className="text-sm text-gray-500 mb-4">Busca un producto en todos los supermercados</p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ej: leche entera..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && comparar()}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>
          <button
            onClick={comparar}
            disabled={loading || !query.trim()}
            className="px-5 py-3 bg-primary-600 text-white rounded-2xl font-medium hover:bg-primary-700 active:scale-95 disabled:opacity-60 transition-all"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Comparando en todos los supermercados..." />
      ) : !buscado ? (
        <EmptyState
          icon={<GitCompare size={64} />}
          title="Compara precios"
          description="Escribe un producto para ver su precio en todos los supermercados disponibles"
        />
      ) : !hayResultados ? (
        <EmptyState
          icon={<Search size={64} />}
          title="Sin resultados"
          description={`No se encontraron productos para "${query}"`}
        />
      ) : (
        <div className="flex flex-col gap-6">
          {resultados
            .filter((r) => r.productos.length > 0)
            .sort((a, b) => (a.productos[0]?.price ?? 999) - (b.productos[0]?.price ?? 999))
            .map((r) => (
              <section key={r.supermercado}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SUPERMERCADO_COLORES[r.supermercado] }}
                  />
                  <h2 className="font-semibold text-gray-700">{r.supermercado}</h2>
                  {r.productos.length > 0 && (
                    <span className="text-xs text-gray-400">
                      desde {r.productos[0].price.toFixed(2)} €
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {r.productos.slice(0, 3).map((p) => (
                    <ProductoCard key={p.id} producto={p} modo="comparador" />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </Layout>
  )
}
