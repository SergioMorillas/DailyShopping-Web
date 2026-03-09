import { IndexedDBListaRepository } from './infrastructure/persistence/IndexedDBListaRepository'
import { MercadonaAdapter } from './infrastructure/supermercados/MercadonaAdapter'
import { AlcampoAdapter } from './infrastructure/supermercados/AlcampoAdapter'
import { DiaAdapter } from './infrastructure/supermercados/DiaAdapter'
import { BMAdapter } from './infrastructure/supermercados/BMAdapter'
import { CarrefourAdapter } from './infrastructure/supermercados/CarrefourAdapter'
import { ObtenerListas } from './application/usecases/lista/ObtenerListas'
import { CrearLista } from './application/usecases/lista/CrearLista'
import { EliminarLista } from './application/usecases/lista/EliminarLista'
import { ActualizarLista } from './application/usecases/lista/ActualizarLista'
import { BuscarListas } from './application/usecases/lista/BuscarListas'
import { ObtenerListaPorId } from './application/usecases/lista/ObtenerListaPorId'
import { BuscarProductos } from './application/usecases/producto/BuscarProductos'
import { CompararPrecios } from './application/usecases/producto/CompararPrecios'
import { JuegoPreciosService } from './domain/services/JuegoPreciosService'
import { PrecioCalculatorService } from './domain/services/PrecioCalculatorService'
import { SupermercadoDisponible } from './domain/entities/SupermercadoDisponible'
import { ISupermercadoPort } from './domain/ports/ISupermercadoPort'

// Repositories
const listaRepo = new IndexedDBListaRepository()

// Supermarket adapters
const supermercadoAdapters = new Map<SupermercadoDisponible, ISupermercadoPort>([
  ['Mercadona', new MercadonaAdapter()],
  ['Alcampo', new AlcampoAdapter()],
  ['Dia', new DiaAdapter()],
  ['BM', new BMAdapter()],
  ['Carrefour', new CarrefourAdapter()],
])

// Use cases
export const useCases = {
  obtenerListas: new ObtenerListas(listaRepo),
  crearLista: new CrearLista(listaRepo),
  eliminarLista: new EliminarLista(listaRepo),
  actualizarLista: new ActualizarLista(listaRepo),
  buscarListas: new BuscarListas(listaRepo),
  obtenerListaPorId: new ObtenerListaPorId(listaRepo),
  buscarProductos: new BuscarProductos(supermercadoAdapters),
  compararPrecios: new CompararPrecios(supermercadoAdapters),
}

// Domain services
export const services = {
  juego: new JuegoPreciosService(),
  precios: new PrecioCalculatorService(),
}
