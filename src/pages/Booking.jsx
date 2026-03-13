import { useState, useEffect } from 'react'
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import { BarberCard } from '../components/BarberCard'
import toast from 'react-hot-toast'

export function Booking() {
const [selectedBarber, setSelectedBarber] = useState(null)
const [horariosOcupados, setHorariosOcupados] = useState([])
const [formData, setFormData] = useState({
servicio: '',
nombre: '',
apellido: '',
fecha: '',
hora: '',
telefono: '',
email: ''
})

const barberos = [
{ id: 1, name: 'Alejandro', specialty: 'Cortes Clásicos' },
{ id: 2, name: 'Marcos', specialty: 'Fade & Estilo' },
{ id: 3, name: 'Tomás', specialty: 'Barba & Color' }
]

const servicios = [
{ id: 'corte', nombre: 'Corte Clásico', precio: '$16.000', duracion: '45 min' },
{ id: 'corte_barba', nombre: 'Corte + Barba', precio: '$18.000', duracion: '1 hora' },
{ id: 'global', nombre: 'Color global', precio: '$55.000', duracion: '2 horas' },
{ id: 'mechas', nombre: 'Mechas', precio: '$50.000', duracion: '2 horas' },
{ id: 'iluminacion', nombre: 'Iluminación', precio: '$30.000', duracion: '2 horas' }
]

const horariosDisponibles = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']

useEffect(() => {
const buscarHorariosOcupados = async () => {
if (!selectedBarber || !formData.fecha) {
setHorariosOcupados([])
return
}

try {
const q = query(
collection(db, "turnos"), 
where("fecha", "==", formData.fecha),
where("barbero", "==", selectedBarber)
)
const querySnapshot = await getDocs(q)
const ocupados = querySnapshot.docs.map(doc => doc.data().hora)
setHorariosOcupados(ocupados)

if (ocupados.includes(formData.hora)) {
setFormData(prev => ({ ...prev, hora: '' }))
}
} catch (error) {
console.error("Error buscando disponibilidad:", error)
}
}
buscarHorariosOcupados()
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedBarber, formData.fecha])

const handleDateChange = (e) => {
const fechaSeleccionada = e.target.value;
const fechaObj = new Date(fechaSeleccionada + 'T00:00:00');
const diaSemana = fechaObj.getDay(); 

if (diaSemana === 0 || diaSemana === 1) {
toast.error("La barbería está cerrada los domingos y lunes. Por favor elegí otro día.")
setFormData({ ...formData, fecha: '', hora: '' }); 
} else {
setFormData({ ...formData, fecha: fechaSeleccionada, hora: '' }); 
}
}

const handleSubmit = async (e) => {
e.preventDefault()
if (!selectedBarber) return toast.error("Por favor, elegí un barbero.")
if (!formData.servicio) return toast.error("Por favor, elegí un servicio.")
if (!formData.hora) return toast.error("Por favor, elegí un horario.")

const loadingToast = toast.loading("Guardando turno...")

try {
const nuevoTurno = {
...formData,
barbero: selectedBarber,
fechaCreacion: new Date(),
estado: 'confirmado'
}

await addDoc(collection(db, "turnos"), nuevoTurno)

toast.dismiss(loadingToast)
toast.success("¡Turno reservado con éxito!")

setFormData({ servicio: '', nombre: '', apellido: '', fecha: '', hora: '', telefono: '' })
setSelectedBarber(null)
setHorariosOcupados([])

} catch (error) {
console.error("Error guardando el turno:", error)
toast.dismiss(loadingToast)
toast.error("Hubo un error de conexión. Intentá de nuevo.")
}
}

return (
<div className="bg-zinc-950 min-h-screen text-white font-sans pb-10">
<header className="bg-zinc-900 pt-12 pb-8 px-6 rounded-b-[3rem] shadow-2xl border-b border-zinc-800 text-center">
<h1 className="text-4xl font-black tracking-tighter italic">BARBERIA <span className="text-red-500">K A</span></h1>
<p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">Reserva tu turno</p>
</header>

<main className="max-w-md mx-auto mt-8 px-6">
<form onSubmit={handleSubmit} className="space-y-8">
  
<section>
<h2 className="text-xl font-bold mb-4 flex items-center">
<span className="text-yellow-500 mr-2">01.</span> Seleccioná tu Barbero
</h2>
<div className="grid grid-cols-2 gap-3">
{barberos.map(b => (
<BarberCard 
key={b.id}
name={b.name}
specialty={b.specialty}
selected={selectedBarber === b.name}
onSelect={() => {
setSelectedBarber(b.name)
setFormData({ ...formData, hora: '' }) 
}}
/>
))}
</div>
</section>

<section>
<h2 className="text-xl font-bold mb-4 flex items-center">
<span className="text-yellow-500 mr-2">02.</span> Elegí tu Servicio
</h2>
<div className="grid grid-cols-1 gap-3">
{servicios.map(s => (
<div 
key={s.id}
onClick={() => setFormData({...formData, servicio: s.nombre})}
className={`cursor-pointer border p-4 rounded-xl transition-all flex justify-between items-center ${
formData.servicio === s.nombre 
? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
: 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
}`}
>
<div>
<p className="font-bold text-white">{s.nombre}</p>
<p className="text-xs text-zinc-400 mt-1">⏳ {s.duracion}</p>
</div>
<div className="font-black text-yellow-500">
{s.precio}
</div>
</div>
))}
</div>
</section>

<section className="space-y-4 max-w-full box-border overflow-x-hidden">
    <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="text-yellow-500 mr-2">03.</span> Fecha y Hora
    </h2>

    <div className="w-full max-w-full box-border">
        <input 
            type="date" 
            required 
            value={formData.fecha}
            min={new Date().toISOString().split('T')[0]} 
            className="w-full max-w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all text-white disabled:opacity-50 box-border appearance-none opacity-100!"
            style={{ 
                colorScheme: 'dark',
                WebkitAppearance: 'none',
            }}
            onChange={handleDateChange}
            disabled={!selectedBarber} 
        />

{formData.fecha && selectedBarber && (
<div className="grid grid-cols-3 gap-2 mt-2">
{horariosDisponibles.map(hora => {
const estaOcupado = horariosOcupados.includes(hora);
return (
<button
key={hora} type="button" disabled={estaOcupado}
onClick={() => setFormData({...formData, hora: hora})}
className={`p-3 rounded-xl font-bold transition-all ${
estaOcupado 
? 'bg-zinc-950 text-zinc-700 border border-zinc-900 cursor-not-allowed line-through' 
: formData.hora === hora 
? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 transform scale-105' 
: 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-yellow-500 hover:text-white'
}`}
>
{hora}
</button>
)
})}
</div>
)}
</div>
</section>

<section className="space-y-4">
<h2 className="text-xl font-bold mb-4 flex items-center">
<span className="text-yellow-500 mr-2">04.</span> Tus Datos
</h2>
<div className="grid grid-cols-2 gap-3">
<input type="text" placeholder="Nombre" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all" />
<input type="text" placeholder="Apellido" required value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all" />
</div>
<input type="tel" placeholder="WhatsApp (Ej: 1122334455)" required value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all" />
<div className="space-y-2">
    <input type="email" placeholder="Correo electrónico" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl focus:outline-none focus:border-yellow-500 transition-all" />
    <p className="text-[10px] text-zinc-500 px-2 uppercase tracking-widest font-bold italic">
        * Aquí recibirás la confirmación de tu reserva
    </p>
</div>
</section>

<button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95">
CONFIRMAR TURNO
</button>
</form>
</main>
</div>
)
}