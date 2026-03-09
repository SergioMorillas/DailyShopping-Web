import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PrincipalListas } from './presentation/pages/PrincipalListas'
import { CreadorListas } from './presentation/pages/CreadorListas'
import { ListaEspecifica } from './presentation/pages/ListaEspecifica'
import { BuscadorProductos } from './presentation/pages/BuscadorProductos'
import { ComparadorProductos } from './presentation/pages/ComparadorProductos'
import { JuegoPrecios } from './presentation/pages/JuegoPrecios'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PrincipalListas />} />
        <Route path="/crear" element={<CreadorListas />} />
        <Route path="/lista/:id" element={<ListaEspecifica />} />
        <Route path="/lista/:id/buscar" element={<BuscadorProductos />} />
        <Route path="/comparar" element={<ComparadorProductos />} />
        <Route path="/juego" element={<JuegoPrecios />} />
      </Routes>
    </BrowserRouter>
  )
}
