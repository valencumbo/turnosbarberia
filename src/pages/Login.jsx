import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'

export function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [error, setError] = useState('')
const navigate = useNavigate()

const handleLogin = async (e) => {
e.preventDefault()
setError('') // Limpiamos errores de intentos previos

try {
// Intentamos iniciar sesión con Firebase
await signInWithEmailAndPassword(auth, email, password)

// Si funciona, lo mandamos como en un tobogán hacia el Dashboard
navigate('/admin/dashboard')

} catch (err) {
console.error(err)
setError('Correo o contraseña incorrectos. Intentá de nuevo.')
}
}

return (
<div className="bg-zinc-950 min-h-screen flex items-center justify-center p-6 text-white font-sans">
<div className="w-full max-w-md bg-zinc-900 p-8 rounded-4x1 shadow-2xl border border-zinc-800">
<div className="text-center mb-8">
<h1 className="text-3xl font-black tracking-tighter italic">
BARBERIA <span className="text-red-500">K A</span>
</h1>
<p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest">
Acceso Exclusivo Staff
</p>
</div>

{/* Mensaje de error (solo aparece si la contraseña está mal) */}
{error && (
<div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">
{error}
</div>
)}

<form onSubmit={handleLogin} className="space-y-5">
<div>
<label className="block text-zinc-400 text-sm mb-2 ml-1">Correo Electrónico</label>
<input 
type="email" 
required 
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-yellow-500 transition-all text-white"
placeholder="ejemplo@gmail.com"
/>
</div>

<div>
<label className="block text-zinc-400 text-sm mb-2 ml-1">Contraseña</label>
<input 
type="password" 
required 
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl focus:outline-none focus:border-yellow-500 transition-all text-white"
placeholder="••••••••"
/>
</div>

<button 
type="submit"
className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform active:scale-95 mt-4"
>
INGRESAR AL PANEL
</button>
</form>
</div>
</div>
)
}