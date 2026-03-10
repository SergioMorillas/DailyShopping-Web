import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ShoppingBag } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
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
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
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
    <>
      <AppHeader title="Nueva Lista" showBack onBack={() => navigate('/listas')} />
      <Layout>
        <div className="flex flex-col gap-5 pt-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre de la lista</label>
            <input
              type="text"
              placeholder="Ej: Compra del lunes"
              value={nombre}
              onChange={(e) => { setNombre(e.target.value); setError('') }}
              className="w-full px-4 py-3.5 bg-white rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30 shadow-sm transition-all"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1.5 mb-0.5" />Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3.5 bg-white rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              <ShoppingBag size={14} className="inline mr-1.5 mb-0.5" />Supermercado
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUPERMERCADOS_DISPONIBLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSupermercado(s)}
                  className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    supermercado === s ? 'border-transparent text-white shadow-md' : 'border-gray-200 text-gray-700 bg-white hover:border-gray-300'
                  }`}
                  style={supermercado === s ? { backgroundColor: SUPERMERCADO_COLORES[s] } : {}}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCrear}
            disabled={loading}
            className="w-full py-4 bg-[#04bcd4] text-white rounded-2xl font-bold text-base hover:bg-[#03aabf] active:scale-95 disabled:opacity-60 transition-all mt-2 shadow-md shadow-[#04bcd4]/30"
          >
            {loading ? 'Creando...' : 'Crear lista'}
          </button>
        </div>
      </Layout>
    </>
  )
}
