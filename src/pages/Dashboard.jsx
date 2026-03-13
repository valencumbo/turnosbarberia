import { useEffect, useState, useCallback } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { db, auth } from '../services/firebase'
import toast from 'react-hot-toast'

export function Dashboard() {
const [turnos, setTurnos] = useState([])
const [cargando, setCargando] = useState(true)
const navigate = useNavigate()

const [bloqueo, setBloqueo] = useState({
barbero: '',
fecha: '',
hora: '',
clienteInfo: ''
})

const barberos = ['Alejandro', 'Marcos', 'Tomás']
const horariosDisponibles = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

// Función para obtener la fecha de hoy en formato YYYY-MM-DD (para las estadísticas)
const obtenerFechaHoy = () => {
const hoy = new Date()
const anio = hoy.getFullYear()
const mes = String(hoy.getMonth() + 1).padStart(2, '0')
const dia = String(hoy.getDate()).padStart(2, '0')
return `${anio}-${mes}-${dia}`
}

const formatearFecha = (fecha) => {
if (!fecha) return ''
const [anio, mes, dia] = fecha.split('-')
return `${dia}/${mes}/${anio}`
}

const obtenerTurnos = useCallback(async () => {
try {
const querySnapshot = await getDocs(collection(db, "turnos"))
let turnosDescargados = querySnapshot.docs.map(documento => ({
id: documento.id,
...documento.data()
}))

turnosDescargados.sort((a, b) => {
if (a.fecha === b.fecha) return a.hora.localeCompare(b.hora)
return a.fecha.localeCompare(b.fecha)
})

setTurnos(turnosDescargados)
setCargando(false)
} catch (error) {
console.error("Error al traer los turnos:", error)
toast.error("Error al cargar los turnos")
setCargando(false)
}
}, [])

useEffect(() => {
// eslint-disable-next-line react-hooks/exhaustive-deps
// eslint-disable-next-line
obtenerTurnos()
}, [obtenerTurnos])

const handleLogout = async () => {
await signOut(auth)
navigate('/admin')
}

const abrirWhatsApp = (telefono, nombre, barbero, fecha, hora) => {
if (telefono === '-') return toast.error('Este es un turno manual sin WhatsApp registrado.')
const telefonoLimpio = telefono.replace(/\D/g, '')
let telefonoFinal = telefonoLimpio
if (!telefonoLimpio.startsWith('549')) telefonoFinal = '549' + telefonoLimpio

const fechaArgentina = formatearFecha(fecha)
const mensaje = `Hola ${nombre}! Somos 4299 Barber. Te escribo para confirmar tu turno del ${fechaArgentina} a las ${hora}.`
window.open(`https://wa.me/${telefonoFinal}?text=${encodeURIComponent(mensaje)}`, '_blank')
}

const handleBloqueoManual = async (e) => {
e.preventDefault()
if (!bloqueo.barbero || !bloqueo.fecha || !bloqueo.hora) {
return toast.error("Completá Barbero, Fecha y Hora para reservar el turno.")
}

const loadingToast = toast.loading("Bloqueando horario...")

try {
const nuevoBloqueo = {
nombre: 'Turno',
apellido: bloqueo.clienteInfo || 'Externo/Manual',
telefono: '-', 
fecha: bloqueo.fecha,
hora: bloqueo.hora,
barbero: bloqueo.barbero,
estado: 'bloqueado',
fechaCreacion: new Date()
}

await addDoc(collection(db, "turnos"), nuevoBloqueo)
toast.dismiss(loadingToast)
toast.success("¡Horario bloqueado con éxito!")

setBloqueo({ barbero: '', fecha: '', hora: '', clienteInfo: '' })
setCargando(true)
obtenerTurnos()

} catch (error) {
console.error("Error bloqueando turno:", error)
toast.dismiss(loadingToast)
toast.error("Hubo un error al bloquear el horario.")
}
}

const handleEliminarTurno = async (idTurno) => {
const confirmar = window.confirm("¿Estás seguro de que querés borrar este turno? Esta acción no se puede deshacer.")
if (!confirmar) return

const loadingToast = toast.loading("Eliminando turno...")
try {
setCargando(true)
await deleteDoc(doc(db, "turnos", idTurno))
toast.dismiss(loadingToast)
toast.success("Turno eliminado correctamente")
obtenerTurnos()
} catch (error) {
console.error("Error al eliminar:", error)
toast.dismiss(loadingToast)
toast.error("Hubo un error al intentar borrar el turno.")
setCargando(false)
}
}

// CÁLCULO DE ESTADÍSTICAS
const fechaHoy = obtenerFechaHoy()
const turnosHoy = turnos.filter(t => t.fecha === fechaHoy).length
const turnosManuales = turnos.filter(t => t.estado === 'bloqueado').length
const totalTurnos = turnos.length

return (
<div className="bg-zinc-950 min-h-screen text-white font-sans pb-10">
<nav className="bg-zinc-900 p-6 flex justify-between items-center border-b border-zinc-800">
<div>
<h1 className="text-2xl font-black tracking-tighter italic text-red-500">K A <span className="text-white">ADMIN</span></h1>
</div>
<button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-red-500 transition-colors font-bold">
Cerrar Sesión
</button>
</nav>

<main className="max-w-7xl mx-auto mt-8 px-6">
  
{/* NUEVA SECCIÓN: Tarjetas de Estadísticas */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
<div>
<p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Turnos Totales</p>
<p className="text-3xl font-black text-white">{totalTurnos}</p>
</div>
<div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl">📋</div>
</div>

<div className="bg-zinc-900 border border-yellow-500/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(234,179,8,0.05)] flex items-center justify-between relative overflow-hidden">
<div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4"></div>
<div className="relative z-10">
<p className="text-yellow-500 text-sm font-bold uppercase tracking-wider mb-1">Turnos para Hoy</p>
<p className="text-3xl font-black text-white">{turnosHoy}</p>
</div>
<div className="relative z-10 w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center text-xl">✂️</div>
</div>

<div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl flex items-center justify-between">
<div>
<p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Reservas Manuales</p>
<p className="text-3xl font-black text-white">{turnosManuales}</p>
</div>
<div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-xl">🔒</div>
</div>
</div>

{/* Grilla principal: Formulario a la izquierda, Tabla a la derecha */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<div className="lg:col-span-1">
<div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-800">
<h3 className="text-xl font-bold mb-4 text-yellow-500">Reservar turno manualmente</h3>
<p className="text-xs text-zinc-400 mb-6">Anotá acá los turnos que te piden por teléfono o clientes externos.</p>
<form onSubmit={handleBloqueoManual} className="space-y-4">
<select required value={bloqueo.barbero} onChange={e => setBloqueo({...bloqueo, barbero: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-yellow-500 text-sm">
<option value="">Elegí un barbero...</option>
{barberos.map(b => <option key={b} value={b}>{b}</option>)}
</select>

<input type="date" required value={bloqueo.fecha} onChange={e => setBloqueo({...bloqueo, fecha: e.target.value})} style={{ colorScheme: 'dark' }} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-yellow-500 text-sm" />

<select required value={bloqueo.hora} onChange={e => setBloqueo({...bloqueo, hora: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-yellow-500 text-sm">
<option value="">Elegí un horario...</option>
{horariosDisponibles.map(h => <option key={h} value={h}>{h}</option>)}
</select>

<input type="text" placeholder="Nombre del cliente (Opcional)" value={bloqueo.clienteInfo} onChange={e => setBloqueo({...bloqueo, clienteInfo: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl focus:outline-none focus:border-yellow-500 text-sm" />

<button type="submit" className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-3 rounded-xl transition-all text-sm">
Guardar Turno Manual
</button>
</form>
</div>
</div>

<div className="lg:col-span-2">
<div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
<div className="p-6 border-b border-zinc-800">
<h2 className="text-2xl font-bold">Agenda General</h2>
</div>
{cargando ? (
<p className="p-8 text-center text-zinc-500">Cargando turnos...</p>
) : turnos.length === 0 ? (
<p className="p-8 text-center text-zinc-500">No hay turnos registrados todavía.</p>
) : (
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-zinc-950 text-zinc-400 text-xs uppercase tracking-wider">
<th className="p-4 font-semibold border-b border-zinc-800">Fecha y Hora</th>
<th className="p-4 font-semibold border-b border-zinc-800">Cliente</th>
<th className="p-4 font-semibold border-b border-zinc-800">Barbero</th>
<th className="p-4 font-semibold text-center border-b border-zinc-800">Acciones</th>
</tr>
</thead>
<tbody className="divide-y divide-zinc-800 text-sm">
{turnos.map((turno) => (
<tr key={turno.id} className="hover:bg-zinc-800/50 transition-colors">
<td className="p-4 min-w-[120px]">
<p className="font-bold text-yellow-500">{formatearFecha(turno.fecha)}</p>
<p className="text-zinc-400">{turno.hora} hs</p>
</td>
<td className="p-4">
<p className={`font-bold text-base ${turno.estado === 'bloqueado' ? 'text-zinc-400 italic' : 'text-white'}`}>
{turno.nombre} {turno.apellido}
</p>
{turno.servicio && <p className="text-yellow-500 text-xs font-bold mt-1 mb-1">{turno.servicio}</p>}
{turno.telefono !== '-' && <p className="text-zinc-500 text-xs mt-1">{turno.telefono}</p>}
</td>
<td className="p-4 text-zinc-300">
{turno.barbero}
</td>
<td className="p-4 flex justify-center items-center gap-2 h-full">
{turno.estado !== 'bloqueado' && (
<button 
onClick={() => abrirWhatsApp(turno.telefono, turno.nombre, turno.barbero, turno.fecha, turno.hora)}
className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-xl transition-all text-xs font-bold shadow-lg"
title="Enviar WhatsApp"
>
WA
</button>
)}

<button 
onClick={() => handleEliminarTurno(turno.id)}
className="bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/30 hover:border-red-600 px-3 py-2 rounded-xl transition-all text-xs font-bold"
title="Eliminar Turno"
>
Borrar
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>
</div>
</div>

</main>
</div>
)
}