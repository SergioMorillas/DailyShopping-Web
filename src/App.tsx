import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './presentation/pages/Landing'
import { Login } from './presentation/pages/Login'
import { Registro } from './presentation/pages/Registro'
import { PrincipalListas } from './presentation/pages/PrincipalListas'
import { CreadorListas } from './presentation/pages/CreadorListas'
import { ListaEspecifica } from './presentation/pages/ListaEspecifica'
import { BuscadorProductos } from './presentation/pages/BuscadorProductos'
import { ComparadorProductos } from './presentation/pages/ComparadorProductos'
import { JuegoPrecios } from './presentation/pages/JuegoPrecios'
import { Perfil } from './presentation/pages/Perfil'
import { ProtectedRoute } from './presentation/components/ProtectedRoute'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/juego" element={<JuegoPrecios />} />

        {/* Protected */}
        <Route path="/listas" element={<ProtectedRoute><PrincipalListas /></ProtectedRoute>} />
        <Route path="/crear" element={<ProtectedRoute><CreadorListas /></ProtectedRoute>} />
        <Route path="/lista/:id" element={<ProtectedRoute><ListaEspecifica /></ProtectedRoute>} />
        <Route path="/lista/:id/buscar" element={<ProtectedRoute><BuscadorProductos /></ProtectedRoute>} />
        <Route path="/comparar" element={<ProtectedRoute><ComparadorProductos /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
