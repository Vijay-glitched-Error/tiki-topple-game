import { useMemo, useState } from "react";

const tips = [
  "Use Tiki Topple to push enemy objective tiki to bottom.",
  "Tiki Toast cannot be your first move of the round.",
  "In 2-player mode, each player gets an extra Tiki Up (1).",
  "Tie on final score triggers a Final Round.",
];

function StatPill({ label, value }) {
  return (
    <div className="rounded-xl bg-blue-900/40 border border-blue-300/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-blue-100/80">{label}</p>
      <p className="font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function Home({ onCreate, onJoin, loading, error }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);

  const tip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], []);

  return (
    <div className="min-h-screen overflow-hidden relative text-white">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,#60a5fa_0%,#2563eb_28%,#1e3a8a_60%,#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-300/20 blur-3xl" />

      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-4 py-4 md:py-6 grid grid-cols-12 gap-4">
        {/* Left rail */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md p-4 shadow-2xl">
            <h3 className="text-lg font-black">PLAYER</h3>
            <input
              className="mt-3 w-full rounded-xl border-2 border-blue-200/70 bg-white/90 text-slate-900 px-3 py-2 font-semibold outline-none"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2 mt-3">
              <StatPill label="Mode" value="Online" />
              <StatPill label="Rules" value="Classic" />
              <StatPill label="Rounds" value="2-4 + Tie" />
              <StatPill label="Sync" value="Realtime" />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md p-4 shadow-2xl">
            <h3 className="text-lg font-black">GAME TIP</h3>
            <p className="mt-2 text-sm text-blue-50/90 leading-relaxed">{tip}</p>
          </div>
        </section>

        {/* Center hero */}
        <section className="col-span-12 lg:col-span-6 rounded-3xl border-2 border-blue-200/50 bg-blue-500/20 backdrop-blur-md shadow-2xl p-4 md:p-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-yellow-300/90 text-slate-900 text-xs font-black">LIVE MULTIPLAYER</div>
            <div className="px-3 py-1 rounded-full bg-emerald-400/90 text-slate-900 text-xs font-black">STABLE</div>
          </div>

          <div className="flex-1 grid place-items-center text-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-black leading-none drop-shadow-[0_4px_0_rgba(0,0,0,0.35)]">
                TIKI
                <span className="block text-yellow-300">TOPPLE</span>
              </h1>
              <p className="mt-2 text-blue-100">Room code based, turn-based strategy battle</p>

              <div className="mx-auto mt-6 w-64 h-40 rounded-3xl bg-white/10 border border-white/30 flex items-center justify-center shadow-inner">
                <div className="text-6xl">🗿🔥🌪️</div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 max-w-md mx-auto text-sm">
                <div className="rounded-xl bg-blue-950/40 border border-blue-300/30 py-2">2-4 Players</div>
                <div className="rounded-xl bg-blue-950/40 border border-blue-300/30 py-2">Secret Goals</div>
                <div className="rounded-xl bg-blue-950/40 border border-blue-300/30 py-2">Rounds</div>
              </div>
            </div>
          </div>
        </section>

        {/* Right actions */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          <div className="rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md p-4 shadow-2xl">
            <h3 className="text-xl font-black">CREATE ROOM</h3>
            <label className="block mt-3 text-sm">Max Players</label>
            <select
              className="mt-1 w-full rounded-xl bg-white text-slate-900 px-3 py-2 font-semibold"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            >
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
            </select>
            <button
              disabled={loading}
              onClick={() => onCreate(name.trim(), maxPlayers)}
              className="mt-4 w-full py-3 rounded-2xl text-xl font-extrabold bg-gradient-to-b from-yellow-300 to-orange-500 text-slate-900 border-2 border-yellow-100 shadow-lg hover:scale-[1.01] transition"
            >
              CREATE
            </button>
          </div>

          <div className="rounded-3xl border-2 border-blue-200/50 bg-blue-500/25 backdrop-blur-md p-4 shadow-2xl">
            <h3 className="text-xl font-black">JOIN ROOM</h3>
            <input
              className="mt-3 w-full rounded-xl border-2 border-blue-200/70 bg-white/90 text-slate-900 px-3 py-2 font-bold uppercase tracking-widest"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button
              disabled={loading}
              onClick={() => onJoin(name.trim(), roomCode.trim())}
              className="mt-4 w-full py-3 rounded-2xl text-xl font-extrabold bg-gradient-to-b from-emerald-300 to-green-500 text-slate-900 border-2 border-emerald-100 shadow-lg hover:scale-[1.01] transition"
            >
              JOIN
            </button>
          </div>
        </section>
      </div>

      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-2 rounded-xl shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}