import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, ShoppingBag } from 'lucide-react'
import { Layout } from '../components/Layout'
import { SUPERMERCADOS_DISPONIBLES, SupermercadoDisponible, SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'
import { useAppStore } from '../store/useAppStore'
import { useCases } from '../../container'

export function CreadorListas() {
  const navigate = useNavigate()
  const { agregarListaAlStore } = useAppStore()
  const [nombre, setNombre] = useState('')
  const [supermercado, setSupermercado] = useState<SupermercadoDisponible>('Mercadona')
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCrear = async () => {
    if (!nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    try {
      const lista = await useCases.crearLista.ejecutar({
        nombre: nombre.trim(),
        supermercado,
        fecha: new Date(fecha + 'T12:00:00').getTime(),
      })
      agregarListaAlStore(lista)
      navigate(`/lista/${lista.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear la lista')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center gap-3 pt-8 mb-8">
        <button
          onClick={() => navigate('/listas')}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nueva Lista</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre de la lista
          </label>
          <input
            type="text"
            placeholder="Ej: Compra del lunes"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setError('') }}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={14} className="inline mr-1.5 mb-0.5" />
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>

        {/* Supermercado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <ShoppingBag size={14} className="inline mr-1.5 mb-0.5" />
            Supermercado
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SUPERMERCADOS_DISPONIBLES.map((s) => (
              <button
                key={s}
                onClick={() => setSupermercado(s)}
                className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-semibold transition-all ${
                  supermercado === s
                    ? 'border-transparent text-white shadow-md'
                    : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                }`}
                style={supermercado === s ? { backgroundColor: SUPERMERCADO_COLORES[s] } : {}}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Botón crear */}
        <button
          onClick={handleCrear}
          disabled={loading}
          className="w-full py-4 bg-primary-600 text-white rounded-2xl font-semibold text-base hover:bg-primary-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2 shadow-md shadow-primary-200"
        >
          {loading ? 'Creando...' : 'Crear lista'}
        </button>
      </div>
    </Layout>
  )
}
