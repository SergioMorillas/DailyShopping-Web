import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogOut, ChevronDown, ChevronUp, User, TrendingUp, ShoppingCart, BarChart2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { AppHeader } from '../components/AppHeader'
import { Layout } from '../components/Layout'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useAuthStore } from '../store/useAuthStore'
import { SUPERMERCADO_COLORES } from '../../domain/entities/SupermercadoDisponible'

interface StatsData {
  totalListas: number
  gastoTotal: number
  gastoMedio: number
  supermercados: { nombre: string; count: number; gasto: number }[]
  productosTop: { nombre: string; count: number; gasto: number }[]
  gastoMensual: { mes: string; gasto: number }[]
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function Perfil() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPassForm, setShowPassForm] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError] = useState('')
  const [passOk, setPassOk] = useState(false)

  useEffect(() => {
    fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) { setPassError('Las contraseñas no coinciden'); return }
    if (newPass.length < 6) { setPassError('Mínimo 6 caracteres'); return }
    setPassLoading(true)
    setPassError('')
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      })
      const data = await res.json()
      if (!res.ok) { setPassError(data.error || 'Error'); return }
      setPassOk(true)
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
      setTimeout(() => { setPassOk(false); setShowPassForm(false) }, 2500)
    } catch {
      setPassError('Error de conexión')
    } finally {
      setPassLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? 'U'

  return (
    <>
      <AppHeader title="Mi Perfil" showBack onBack={() => navigate(-1)} />
      <Layout>
        <div className="pt-4 flex flex-col gap-5 pb-6">

          {/* User card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#04bcd4] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{user?.username}</p>
              <p className="text-sm text-[#888888]">{user?.email}</p>
            </div>
          </div>

          {loading ? <LoadingSpinner text="Cargando estadísticas..." /> : stats && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShoppingCart, label: 'Listas', value: String(stats.totalListas) },
                  { icon: TrendingUp, label: 'Total gastado', value: `${stats.gastoTotal.toFixed(2)} €` },
                  { icon: BarChart2, label: 'Media/lista', value: `${stats.gastoMedio.toFixed(2)} €` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-white rounded-2xl p-3 shadow-sm text-center">
                    <Icon size={20} className="text-[#04bcd4] mx-auto mb-1" />
                    <p className="text-xs text-[#888888] font-medium">{label}</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Pie: supermercados */}
              {stats.supermercados.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-1">Supermercados</h3>
                  <p className="text-xs text-[#888888] mb-3">Distribución de tus listas</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.supermercados}
                        dataKey="count"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {stats.supermercados.map((s) => (
                          <Cell
                            key={s.nombre}
                            fill={SUPERMERCADO_COLORES[s.nombre as keyof typeof SUPERMERCADO_COLORES] ?? '#04bcd4'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [`${value} lista${value !== 1 ? 's' : ''}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2 justify-center mt-1">
                    {stats.supermercados.map(s => (
                      <div key={s.nombre} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SUPERMERCADO_COLORES[s.nombre as keyof typeof SUPERMERCADO_COLORES] ?? '#04bcd4' }} />
                        <span className="text-xs text-gray-600">{s.nombre}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pie: gasto por supermercado */}
              {stats.supermercados.filter(s => s.gasto > 0).length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-1">Gasto por supermercado</h3>
                  <p className="text-xs text-[#888888] mb-3">Euros totales en cada cadena</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.supermercados.filter(s => s.gasto > 0)}
                        dataKey="gasto"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        labelLine={false}
                        label={renderCustomLabel}
                      >
                        {stats.supermercados.filter(s => s.gasto > 0).map((s) => (
                          <Cell
                            key={s.nombre}
                            fill={SUPERMERCADO_COLORES[s.nombre as keyof typeof SUPERMERCADO_COLORES] ?? '#04bcd4'}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)} €`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar: productos más comprados */}
              {stats.productosTop.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-1">Productos más comprados</h3>
                  <p className="text-xs text-[#888888] mb-3">Unidades totales añadidas a listas</p>
                  <ResponsiveContainer width="100%" height={stats.productosTop.length * 36 + 20}>
                    <BarChart
                      data={stats.productosTop}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={110}
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v: string) => v.length > 16 ? v.slice(0, 14) + '…' : v}
                      />
                      <Tooltip formatter={(v: any) => [`${v} uds`]} />
                      <Bar dataKey="count" fill="#04bcd4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Bar: gasto mensual */}
              {stats.gastoMensual.some(m => m.gasto > 0) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-1">Gasto mensual</h3>
                  <p className="text-xs text-[#888888] mb-3">Últimos 6 meses</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.gastoMensual} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}€`} />
                      <Tooltip formatter={(v: any) => [`${Number(v).toFixed(2)} €`, 'Gasto']} />
                      <Bar dataKey="gasto" fill="#04bcd4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* No stats yet */}
              {stats.totalListas === 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <User size={40} className="text-[#04bcd4]/30 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Crea tu primera lista para ver estadísticas</p>
                </div>
              )}
            </>
          )}

          {/* Cambiar contraseña */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowPassForm(s => !s)}
              className="w-full flex items-center justify-between p-4 font-bold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <span>Cambiar contraseña</span>
              {showPassForm ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {showPassForm && (
              <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100">
                {passOk && (
                  <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded-xl font-medium mt-3">
                    ✓ Contraseña actualizada correctamente
                  </div>
                )}
                <div className="relative mt-3">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Contraseña actual"
                    value={currentPass}
                    onChange={e => setCurrentPass(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30 pr-12"
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30"
                />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#04bcd4]/30"
                />
                {passError && <p className="text-red-500 text-sm">{passError}</p>}
                <button
                  onClick={handleChangePassword}
                  disabled={passLoading || !currentPass || !newPass || !confirmPass}
                  className="w-full py-3 bg-[#04bcd4] text-white rounded-xl font-bold hover:bg-[#03aabf] disabled:opacity-50 transition-all"
                >
                  {passLoading ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 active:scale-95 transition-all"
          >
            <LogOut size={19} />
            Cerrar sesión
          </button>

        </div>
      </Layout>
    </>
  )
}
