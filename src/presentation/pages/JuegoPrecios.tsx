import { useState, useCallback, useEffect } from 'react'
import { Star, ArrowUp, ArrowDown, RotateCcw, Trophy } from 'lucide-react'
import { AppHeader } from '../components/AppHeader'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useCases, services } from '../../container'
import { Producto } from '../../domain/entities/Producto'
import { ResultadoIntento } from '../../domain/services/JuegoPreciosService'

type EstadoJuego = 'cargando' | 'jugando' | 'ganado' | 'perdido'

interface IntentoDisplay {
  valor: number
  resultado: ResultadoIntento
}

const SUPERMERCADOS_JUEGO = ['Mercadona', 'Alcampo', 'Dia'] as const
const PALABRAS_BUSQUEDA = ['leche', 'pan', 'aceite', 'agua', 'arroz', 'pasta', 'yogur', 'queso', 'jamón', 'pollo']

export function JuegoPrecios() {
  const [estado, setEstado] = useState<EstadoJuego>('cargando')
  const [producto, setProducto] = useState<Producto | null>(null)
  const [intentos, setIntentos] = useState<IntentoDisplay[]>([])
  const [inputValor, setInputValor] = useState('')
  const [error, setError] = useState('')
  const maxIntentos = services.juego.maxIntentos

  const cargarProducto = useCallback(async () => {
    setEstado('cargando')
    setIntentos([])
    setInputValor('')
    setError('')
    setProducto(null)

    const palabra = PALABRAS_BUSQUEDA[Math.floor(Math.random() * PALABRAS_BUSQUEDA.length)]
    const supermercado = SUPERMERCADOS_JUEGO[Math.floor(Math.random() * SUPERMERCADOS_JUEGO.length)]

    try {
      const productos = await useCases.buscarProductos.ejecutar(palabra, supermercado)
      const productosValidos = productos.filter((p) => p.price > 0 && p.image)
      if (productosValidos.length === 0) throw new Error('Sin productos')
      const random = productosValidos[Math.floor(Math.random() * Math.min(productosValidos.length, 10))]
      setProducto(random)
      setEstado('jugando')
    } catch {
      cargarProducto()
    }
  }, [])

  useEffect(() => { cargarProducto() }, [cargarProducto])

  const handleAdivinar = () => {
    if (!producto) return
    const valor = parseFloat(inputValor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      setError('Introduce un precio válido')
      return
    }
    setError('')

    const resultado = services.juego.evaluarIntento(producto, valor)
    const nuevosIntentos = [...intentos, { valor, resultado }]
    setIntentos(nuevosIntentos)
    setInputValor('')

    if (services.juego.esAcierto(resultado)) {
      setEstado('ganado')
    } else if (nuevosIntentos.length >= maxIntentos) {
      setEstado('perdido')
    }
  }

  const iconoResultado = (r: ResultadoIntento) => {
    if (r === 'correcto') return <Star className="text-[#BBA53D] fill-[#BBA53D]" size={18} />
    if (r === 'tolerancia') return <Star className="text-[#C0C0C0] fill-[#C0C0C0]" size={18} />
    if (r === 'alto') return <ArrowDown className="text-[#FF0000]" size={18} />
    return <ArrowUp className="text-[#FF0000]" size={18} />
  }

  const mensajeResultado = (r: ResultadoIntento) => {
    if (r === 'correcto') return 'Precio exacto!'
    if (r === 'tolerancia') return 'Muy cerca!'
    if (r === 'alto') return 'Demasiado alto'
    return 'Demasiado bajo'
  }

  if (estado === 'cargando') {
    return (
      <>
        <AppHeader title="Juego de precios" />
        <Layout><LoadingSpinner text="Cargando producto..." /></Layout>
      </>
    )
  }

  return (
    <>
      <AppHeader
        title="Juego de precios"
        rightAction={
          <button
            onClick={cargarProducto}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        }
      />
      <Layout>
        <div className="pt-4">
          {producto && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
              {/* Imagen del producto */}
              <div className="bg-gray-50 p-8 flex items-center justify-center">
                <img
                  src={producto.image}
                  alt={producto.name}
                  className="h-40 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>

              <div className="p-5">
                <p className="text-xs text-[#888888] font-semibold uppercase tracking-wide mb-1">
                  {producto.supermercado}
                </p>
                <h2 className="font-bold text-gray-900 text-base mb-3 line-clamp-2">
                  {producto.name}
                </h2>

                {/* Progreso de intentos */}
                <div className="flex gap-1.5 mb-4">
                  {Array.from({ length: maxIntentos }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < intentos.length
                          ? services.juego.esAcierto(intentos[i].resultado)
                            ? 'bg-[#04bcd4]'
                            : 'bg-red-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Historial de intentos */}
                {intentos.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {intentos.map((intento, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          {iconoResultado(intento.resultado)}
                          <span className="text-sm text-gray-600">{mensajeResultado(intento.resultado)}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{intento.valor.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Estado: ganado */}
                {estado === 'ganado' && (
                  <div className="text-center py-4">
                    <Trophy size={40} className="text-[#BBA53D] mx-auto mb-2" />
                    <p className="font-bold text-gray-900 text-lg">¡Correcto!</p>
                    <p className="text-[#04bcd4] font-bold text-2xl mt-1">
                      {producto.price.toFixed(2)} €
                    </p>
                    <button
                      onClick={cargarProducto}
                      className="mt-4 w-full py-3 bg-[#04bcd4] text-white rounded-2xl font-bold hover:bg-[#03aabf] active:scale-95 transition-all"
                    >
                      Siguiente producto
                    </button>
                  </div>
                )}

                {/* Estado: perdido */}
                {estado === 'perdido' && (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-1">El precio era</p>
                    <p className="font-bold text-2xl text-gray-900">{producto.price.toFixed(2)} €</p>
                    <button
                      onClick={cargarProducto}
                      className="mt-4 w-full py-3 bg-[#95949B] text-white rounded-2xl font-bold hover:bg-gray-500 active:scale-95 transition-all"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                )}

                {/* Input de precio */}
                {estado === 'jugando' && (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0,00"
                          value={inputValor}
                          onChange={(e) => { setInputValor(e.target.value); setError('') }}
                          onKeyDown={(e) => e.key === 'Enter' && handleAdivinar()}
                          className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-base font-semibold focus:outline-none focus:border-[#04bcd4] focus:ring-2 focus:ring-[#04bcd4]/20 transition-all"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleAdivinar}
                        disabled={!inputValor}
                        className="px-5 py-3 bg-[#04bcd4] text-white rounded-2xl font-bold hover:bg-[#03aabf] active:scale-95 disabled:opacity-60 transition-all"
                      >
                        Adivinar
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
                    <p className="text-xs text-[#888888] text-center mt-2">
                      Intento {intentos.length + 1} de {maxIntentos} · Margen ±25%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
