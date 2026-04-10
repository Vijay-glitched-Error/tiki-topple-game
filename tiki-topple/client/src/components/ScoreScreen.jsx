export default function ScoreScreen({ state, myId, mySecretCards, revealedSecrets, onContinue }) {
  const rankedPlayers = [...state.players]
    .map((p) => ({ ...p, score: state.scoreboard[p.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const top3 = state.round?.tikiOrder?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e3a8a,#0f172a)] text-white p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-6 space-y-4">
        <h2 className="text-3xl font-extrabold text-center">
          {state.gameEnded ? "Game Over" : "Round Complete"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-black/20 p-4">
            <h3 className="font-bold mb-3">Top 3 Tikis</h3>
            <div className="space-y-2">
              {top3.map((t, i) => (
                <div key={t} className="rounded-lg bg-white/10 px-3 py-2 flex justify-between">
                  <span>#{i + 1}</span>
                  <span>Tiki {t}</span>
                </div>
              ))}
            </div>

            <h4 className="font-bold mt-4 mb-2">Your Secret</h4>
            <div className="space-y-2">
              {mySecretCards.map((c) => (
                <div key={`${c.slot}-${c.tikiId}`} className="rounded-lg bg-white/10 px-3 py-2 text-sm flex justify-between">
                  <span>Tiki {c.tikiId}</span>
                  <span>{c.points} pts (Top {c.needsTopN})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-black/20 p-4">
            <h3 className="font-bold mb-3">Scores</h3>
            <div className="space-y-2">
              {rankedPlayers.map((p, i) => (
                <div key={p.id} className="rounded-lg bg-white/10 px-3 py-2 flex justify-between items-center">
                  <span>{i + 1}. {p.name}{p.id === myId ? " (You)" : ""}</span>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900"
        >
          {state.gameEnded ? "Back to Home" : "Continue"}
        </button>
      </div>
    </div>
  );
}