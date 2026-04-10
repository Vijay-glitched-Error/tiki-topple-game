export default function Lobby({ state, myId, onStart, onLeave }) {
  const isHost = state.hostId === myId;
  const hostName = state.players.find((p) => p.id === state.hostId)?.name || "N/A";

  return (
    <div className="min-h-screen overflow-hidden relative text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,#60a5fa_0%,#2563eb_30%,#1e3a8a_65%,#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative z-10 max-w-7xl mx-auto min-h-screen px-4 py-4 md:py-6 grid grid-cols-12 gap-4">
        {/* Left: Room info */}
        <section className="col-span-12 lg:col-span-4 rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md shadow-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black">ROOM LOBBY</h2>
            <button onClick={onLeave} className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold">
              Leave
            </button>
          </div>

          <div className="rounded-2xl bg-blue-950/40 border border-blue-300/30 p-4 text-sm space-y-2">
            <p><b>Room Code:</b> <span className="tracking-widest">{state.roomCode}</span></p>
            <p><b>Max Players:</b> {state.maxPlayers}</p>
            <p><b>Host:</b> {hostName}</p>
          </div>

          <div className="rounded-2xl bg-blue-950/40 border border-blue-300/30 p-4">
            <p className="text-xs text-blue-100 mb-2">STATUS</p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2 py-1 rounded-full bg-emerald-400 text-slate-900 text-xs font-black">
                {state.players.length >= 2 ? "Ready to start" : "Need 2 players"}
              </span>
              <span className="px-2 py-1 rounded-full bg-yellow-300 text-slate-900 text-xs font-black">
                Realtime Sync
              </span>
            </div>
          </div>
        </section>

        {/* Center: Big room code + player progress */}
        <section className="col-span-12 lg:col-span-5 rounded-3xl border-2 border-blue-200/50 bg-blue-500/20 backdrop-blur-md shadow-2xl p-5 flex flex-col">
          <div className="text-center">
            <p className="text-blue-100 text-sm">Share this code with friends</p>
            <div className="mt-2 text-5xl md:text-6xl font-black tracking-[0.15em] text-yellow-300 drop-shadow">
              {state.roomCode}
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-blue-950/40 border border-blue-300/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Room Fill</span>
              <span>{state.players.length}/{state.maxPlayers}</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-300 to-green-500"
                style={{ width: `${(state.players.length / state.maxPlayers) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            {isHost ? (
              <button
                onClick={onStart}
                disabled={state.players.length < 2}
                className="px-10 py-4 rounded-2xl text-2xl font-black bg-gradient-to-b from-yellow-300 to-orange-500 text-slate-900 border-2 border-yellow-100 disabled:opacity-50"
              >
                START GAME
              </button>
            ) : (
              <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 inline-block">
                Waiting for host to start...
              </div>
            )}
          </div>
        </section>

        {/* Right: players list */}
        <section className="col-span-12 lg:col-span-3 rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md shadow-2xl p-5">
          <h3 className="text-xl font-black mb-3">PLAYERS</h3>
          <div className="space-y-2">
            {state.players.map((p, i) => (
              <div key={p.id} className="rounded-xl bg-blue-950/45 border border-blue-300/30 px-3 py-3 flex justify-between items-center">
                <span className="font-semibold">{i + 1}. {p.name}</span>
                {p.id === state.hostId && (
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-300 text-slate-900 font-black">HOST</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}