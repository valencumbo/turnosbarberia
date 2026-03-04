import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Booking } from './pages/Booking'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function App() {
return (
<BrowserRouter>
{/* ESTO ACTIVA LAS NOTIFICACIONES EN TODA LA PÁGINA */}
<Toaster 
position="top-center"
toastOptions={{
style: {
background: '#18181b', // Color zinc-900
color: '#fff',
border: '1px solid #27272a', // Color zinc-800
},
}} 
/>
<Routes>
<Route path="/" element={<Booking />} />
<Route path="/admin" element={<Login />} />
<Route path="/admin/dashboard" element={<Dashboard />} />
</Routes>
</BrowserRouter>
)
}

export default App