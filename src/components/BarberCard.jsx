export function BarberCard({ name, specialty, selected, onSelect }) {
    return (
        <div 
        onClick={onSelect}
        className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 ${
            selected 
                ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
        }`}
    >
        <div className="w-16 h-16 bg-zinc-800 rounded-full mx-auto mb-3 border border-zinc-700 flex items-center justify-center">
            <span className="text-zinc-500 text-xl font-bold">{name[0]}</span>
        </div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-xs text-zinc-500">{specialty}</p>
        </div>
    )
}