import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tikiColors = [
  "from-red-400 to-red-500",
  "from-pink-400 to-fuchsia-500",
  "from-lime-400 to-green-500",
  "from-orange-400 to-amber-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-400 to-violet-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-yellow-300 to-orange-500",
];

export default function GameBoard({ state, myId, myHand, mySecretCards, onPlay, onLeave, message }) {
  const [selectedCardUid, setSelectedCardUid] = useState("");
  const [targetTikiId, setTargetTikiId] = useState(null);

  const round = state?.round;
  if (!state || !round || !state.players?.length) {
    return (
      <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top,#1e3a8a,#0f172a)] text-white">
       <div className="rounded-xl bg-white/10 border border-white/20 px-4 py-3">
         Loading game state...
      </div>
    </div>
  );
}
const currentPlayer = state.players[round.currentTurn] || state.players[0];
  const isMyTurn = currentPlayer?.id === myId;

  const selectedCard = myHand.find((c) => c.uid === selectedCardUid);

  const needTarget = selectedCard && selectedCard.type !== "TOAST";

  const canSubmit =
    isMyTurn &&
    selectedCard &&
    (!needTarget || targetTikiId !== null);

  const leaderboard = useMemo(
    () => [...state.players].map((p) => ({ ...p, score: state.scoreboard[p.id] || 0 })).sort((a, b) => b.score - a.score),
    [state.players, state.scoreboard]
  );

  const play = () => {
    if (!canSubmit) return;
    onPlay({
      cardUid: selectedCard.uid,
      type: selectedCard.type,
      targetTikiId: needTarget ? targetTikiId : null,
    });
    setSelectedCardUid("");
    setTargetTikiId(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#1e3a8a,#0f172a)] text-white p-3">
      <div className="h-full max-w-7xl mx-auto grid grid-cols-12 gap-3">
        {/* Left */}
        <div className="col-span-12 lg:col-span-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-black">Tiki Arena</h2>
            <button onClick={onLeave} className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600">Exit</button>
          </div>

          <div className="rounded-xl bg-black/20 p-2 text-sm space-y-1">
            <p>Round: {state.currentRound}/{state.totalRounds}{state.isTieBreakerRound ? " (Tie Breaker)" : ""}</p>
            <p>Turn: {currentPlayer?.name || "-"}</p>
            <p>Your cards left: {myHand.length}</p>
          </div>

          <div className="rounded-xl bg-black/20 p-2">
            <p className="text-xs text-blue-100 mb-2">Your Secret Card (Private)</p>
            <div className="space-y-2">
              {mySecretCards.map((c) => (
                <div key={`${c.slot}-${c.tikiId}`} className="rounded-lg bg-white/10 px-3 py-2 text-sm flex justify-between">
                  <span>Tiki {c.tikiId}</span>
                  <span>{c.points} pts (Top {c.needsTopN})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-black/20 p-2 flex-1 overflow-auto">
            <p className="text-xs text-blue-100 mb-2">Scores</p>
            <div className="space-y-2">
              {leaderboard.map((p) => (
                <div key={p.id} className="rounded-lg bg-white/10 px-3 py-2 flex justify-between text-sm">
                  <span>{p.name}</span>
                  <span className="font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center stack */}
        <div className="col-span-12 lg:col-span-5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-3 flex flex-col">
          <h3 className="font-bold mb-2">Tiki Stack (Top → Bottom)</h3>
          <div className="flex-1 overflow-auto space-y-2">
            <AnimatePresence>
              {round.tikiOrder.map((id, idx) => (
                <motion.button
                  key={id}
                  layout
                  onClick={() => isMyTurn && setTargetTikiId(id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold bg-gradient-to-r ${tikiColors[(id - 1) % tikiColors.length]}
                    ${targetTikiId === id ? "ring-2 ring-white" : ""} ${!isMyTurn ? "opacity-80" : ""}`}
                >
                  #{idx + 1} — Tiki {id}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right hand */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-3 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold">Your Action Cards</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${isMyTurn ? "bg-emerald-500" : "bg-slate-500"}`}>
              {isMyTurn ? "Your Turn" : "Waiting"}
            </span>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {myHand.map((c) => (
              <button
                key={c.uid}
                disabled={!isMyTurn}
                onClick={() => setSelectedCardUid(c.uid)}
                className={`w-full text-left rounded-xl px-3 py-3 border ${
                  selectedCardUid === c.uid ? "bg-yellow-300 text-slate-900 border-yellow-100" : "bg-white/10 border-white/20"
                }`}
              >
                <div className="font-bold">{c.label}</div>
                <div className="text-xs opacity-80">
                  {c.type}{c.steps ? ` (${c.steps})` : ""}
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={!canSubmit}
            onClick={play}
            className="w-full py-3 rounded-xl font-black bg-gradient-to-r from-yellow-300 to-orange-500 text-slate-900 disabled:opacity-50"
          >
            Play Card
          </button>

          {message && <p className="text-sm text-rose-200">{message}</p>}
        </div>
      </div>
    </div>
  );
}