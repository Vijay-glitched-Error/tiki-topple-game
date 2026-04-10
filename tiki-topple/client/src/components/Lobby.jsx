import { useMemo, useState } from "react";

export default function Lobby({ state, myId, onStart, onLeave, error }) {
  const [copied, setCopied] = useState(false);

  const host = state.players.find((p) => p.id === state.hostId);
  const isHost = myId === state.hostId;
  const canStart = state.players.length >= 2;
  const fillPct = Math.round((state.players.length / state.maxPlayers) * 100);

  const placeholderSlots = useMemo(() => {
    const missing = Math.max(0, state.maxPlayers - state.players.length);
    return Array.from({ length: missing }, (_, i) => i);
  }, [state.maxPlayers, state.players.length]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(state.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = state.roomCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    }
  };

  const initials = (name) => (name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_700px_at_50%_-20%,#3B82F6_0%,#1E3A8A_45%,#0B1E5B_100%)] text-white p-4 sm:p-6">
      <div className="max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* LEFT: Room info */}
          <section className="xl:col-span-3 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Room Lobby</h2>
              <button
                onClick={onLeave}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 font-semibold transition"
              >
                Leave
              </button>
            </div>

            <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-4 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-200/80">Room Info</p>
                <div className="mt-2 space-y-1 text-base sm:text-lg">
                  <p><span className="text-slate-300">Room Code:</span> <span className="font-bold">{state.roomCode}</span></p>
                  <p><span className="text-slate-300">Max Players:</span> <span className="font-bold">{state.maxPlayers}</span></p>
                  <p><span className="text-slate-300">Host:</span> <span className="font-bold">{host?.name || "-"}</span></p>
                </div>
              </div>

              <button
                onClick={copyCode}
                className={`w-full rounded-xl py-2.5 font-semibold transition ${
                  copied
                    ? "bg-emerald-500 text-slate-900"
                    : "bg-sky-500 hover:bg-sky-600 text-white"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy Room Code"}
              </button>

              <p className="text-sm text-slate-200/90">
                Invite your friends and ask them to join with this code.
              </p>
            </div>
          </section>

          {/* CENTER: Big room code + progress + start */}
          <section className="xl:col-span-5 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-2xl">
            <p className="text-center text-slate-100 text-lg sm:text-xl">Share this code with friends</p>

            <div className="mt-2 mb-5 rounded-2xl border border-white/15 bg-gradient-to-r from-yellow-300/20 to-amber-300/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-5xl sm:text-7xl font-black tracking-[0.12em] text-yellow-300 drop-shadow">
                  {state.roomCode}
                </h3>
                <button
                  onClick={copyCode}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    copied ? "bg-emerald-500 text-slate-900" : "bg-slate-100/20 hover:bg-slate-100/30"
                  }`}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/30 border border-white/10 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-lg sm:text-xl font-semibold">Player Join Progress</p>
                <p className="text-lg sm:text-xl font-bold">{state.players.length}/{state.maxPlayers}</p>
              </div>
              <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {isHost ? (
              <button
                onClick={onStart}
                disabled={!canStart}
                className={`w-full rounded-2xl py-4 sm:py-5 text-3xl sm:text-5xl font-black transition-all duration-300 ${
                  canStart
                    ? "bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-300 text-slate-900 hover:scale-[1.01] shadow-[0_0_35px_rgba(52,211,153,0.45)] animate-pulse"
                    : "bg-gradient-to-r from-slate-400/70 to-slate-500/70 text-slate-800 cursor-not-allowed"
                }`}
              >
                START GAME
              </button>
            ) : (
              <div className="w-full rounded-2xl py-4 text-center text-lg bg-slate-900/30 border border-white/10">
                Waiting for host to start...
              </div>
            )}

            <p className={`mt-3 text-base sm:text-lg ${canStart ? "text-emerald-200" : "text-amber-200"}`}>
              {canStart ? "Lobby ready. You can start now." : "Need at least 2 players to start."}
            </p>

            {error && (
              <div className="mt-3 rounded-xl bg-rose-500/20 border border-rose-300/40 text-rose-100 px-3 py-2 text-sm">
                {error}
              </div>
            )}
          </section>

          {/* RIGHT: Players list */}
          <section className="xl:col-span-4 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-3xl sm:text-5xl font-extrabold">Players</h3>
              <span className="text-sm rounded-full px-3 py-1 bg-white/15">
                {state.players.length}/{state.maxPlayers}
              </span>
            </div>

            <div className="space-y-3">
              {state.players.map((p, i) => {
                const isPlayerHost = p.id === state.hostId;
                const isReady = state.players.length >= 2; // simple indicator without changing logic

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-slate-900/30 border border-white/10 px-3 py-3 flex items-center gap-3"
                  >
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-300 to-indigo-400 text-slate-900 font-black grid place-items-center">
                      {initials(p.name)}
                    </div>

                    {/* Name + status */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">
                        {i + 1}. {p.name}
                        {p.id === myId ? " (You)" : ""}
                      </p>
                      <p className="text-xs text-slate-300">
                        {isReady ? "Ready" : "Waiting for players..."}
                      </p>
                    </div>

                    {/* Ready dot */}
                    <span
                      className={`h-3 w-3 rounded-full ${isReady ? "bg-emerald-400" : "bg-amber-300"}`}
                      title={isReady ? "Ready" : "Waiting"}
                    />

                    {/* Host badge */}
                    {isPlayerHost && (
                      <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-yellow-300 text-black">
                        HOST
                      </span>
                    )}

                    {/* Leave button (only for non-host rows, UI only placeholder) */}
                    {!isPlayerHost && (
                      <button
                        className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/80 hover:bg-rose-500"
                        onClick={onLeave}
                        title="Leave room"
                      >
                        Leave
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Empty slots */}
              {placeholderSlots.map((slot) => (
                <div
                  key={`slot-${slot}`}
                  className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-3 py-3 flex items-center gap-3 text-slate-300"
                >
                  <div className="h-11 w-11 rounded-full bg-white/10 grid place-items-center">+</div>
                  <div>
                    <p className="font-semibold">Waiting for player...</p>
                    <p className="text-xs text-slate-400">Open slot</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
