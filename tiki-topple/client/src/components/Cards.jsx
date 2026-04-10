const icons = {
  UP: "⬆️",
  TOPPLE: "🌪️",
  TOAST: "🔥"
};

export default function Cards({ hand, selectedCardId, onSelect, disabled }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {hand.map((card) => (
        <button
          key={card.id}
          disabled={disabled}
          onClick={() => onSelect(card)}
          className={`relative text-left rounded-2xl p-4 border transition-all ${
            selectedCardId === card.id
              ? "bg-gradient-to-br from-yellow-200 to-orange-200 border-amber-300 text-slate-900 ring-2 ring-amber-300"
              : "bg-white/90 border-white/60 text-slate-900 hover:scale-[1.01]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : "shadow-lg"}`}
        >
          <div className="absolute top-2 right-2 text-lg">{icons[card.type] || "🃏"}</div>
          <p className="font-extrabold text-base pr-8">{card.title}</p>
          <p className="text-sm mt-1">{card.desc}</p>
          <p className="text-xs mt-3 italic text-slate-600">{card.usage}</p>
        </button>
      ))}
    </div>
  );
}