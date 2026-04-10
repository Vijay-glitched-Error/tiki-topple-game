const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;
const rooms = {};

// ---------- Utilities ----------
function safeCb(cb, payload) {
  try {
    if (typeof cb === "function") cb(payload);
  } catch (e) {
    console.error("Callback error:", e);
  }
}

function safeHandler(eventName, handler) {
  return (...args) => {
    const cb = args[args.length - 1];
    try {
      handler(...args);
    } catch (err) {
      console.error(`[${eventName}] Unhandled error:`, err);
      safeCb(cb, { ok: false, error: "Internal server error" });
    }
  };
}

function validateString(v, max = 64) {
  return typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;
}

function isValidRoomCode(code) {
  return typeof code === "string" && /^[A-Z0-9]{6}$/.test(code);
}

function isValidPlayerCount(n) {
  return [2, 3, 4].includes(Number(n));
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Rules ----------
function roundCountByPlayers(n) {
  if (n === 2) return 2;
  if (n === 3) return 3;
  if (n === 4) return 4;
  return 0;
}

function buildRoundDeck(playerCount) {
  // 2 players -> 8 cards
  const deck2P = [
    { type: "UP", steps: 1, label: "Tiki Up 1" },
    { type: "UP", steps: 1, label: "Tiki Up 1" },
    { type: "UP", steps: 2, label: "Tiki Up 2" },
    { type: "UP", steps: 3, label: "Tiki Up 3" },
    { type: "TOAST", label: "Tiki Toast" },
    { type: "TOAST", label: "Tiki Toast" },
    { type: "TOPPLE", label: "Tiki Topple" },
    { type: "MAX", label: "Tiki Max" }, // NEW
  ];

  // 3/4 players -> 7 cards
  const deck3Or4P = [
    { type: "UP", steps: 1, label: "Tiki Up 1" },
    { type: "UP", steps: 2, label: "Tiki Up 2" },
    { type: "UP", steps: 3, label: "Tiki Up 3" },
    { type: "TOAST", label: "Tiki Toast" },
    { type: "TOAST", label: "Tiki Toast" },
    { type: "TOPPLE", label: "Tiki Topple" },
    { type: "MAX", label: "Tiki Max" }, // NEW
  ];

  const base = playerCount === 2 ? deck2P : deck3Or4P;

  return base.map((c, i) => ({
    ...c,
    uid: `${c.type}-${c.steps || 0}-${i}-${Math.random().toString(16).slice(2, 8)}`,
  }));
}

// Secret scoring:
// slot1: 9 pts if tiki ends 1st
// slot2: 5 pts if tiki ends 1st/2nd
// slot3: 2 pts if tiki ends 1st/2nd/3rd
function dealSecretCards(players) {
  const out = {};
  const pool = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

  players.forEach((p, idx) => {
    const s = (idx * 2) % 9;
    const picks = [pool[s], pool[(s + 1) % 9], pool[(s + 2) % 9]];
    out[p.id] = [
      { slot: 1, tikiId: picks[0], points: 9, needsTopN: 1 },
      { slot: 2, tikiId: picks[1], points: 5, needsTopN: 2 },
      { slot: 3, tikiId: picks[2], points: 2, needsTopN: 3 },
    ];
  });

  return out;
}

// ---------- State ----------
function initRoundState(room) {
  const hands = {};
  room.players.forEach((p) => {
    hands[p.id] = buildRoundDeck(room.players.length);
  });

  return {
    tikiOrder: shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]), // top -> bottom
    removedTikis: [],
    hands,
    secretCards: dealSecretCards(room.players), // private
    currentTurn: room.roundStarterIndex % room.players.length,
    hasAnyMove: false,
    ended: false,
  };
}

function publicState(room) {
  const rs = room.roundState;
  const cardsRemainingByPlayer = {};

  if (rs?.hands) {
    room.players.forEach((p) => {
      cardsRemainingByPlayer[p.id] = rs.hands[p.id]?.length || 0;
    });
  }

  return {
    roomCode: room.roomCode,
    hostId: room.hostId,
    maxPlayers: room.maxPlayers,
    gameStarted: room.gameStarted,
    gameEnded: room.gameEnded,
    players: room.players.map((p) => ({ id: p.id, name: p.name })),
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    isTieBreakerRound: room.isTieBreakerRound,
    scoreboard: room.scoreboard,
    round: rs
      ? {
          tikiOrder: rs.tikiOrder,
          removedTikis: rs.removedTikis,
          currentTurn: rs.currentTurn,
          cardsRemainingByPlayer,
        }
      : null,
    winnerIds: room.winnerIds || [],
  };
}

function emitPrivateState(room) {
  const rs = room.roundState;
  room.players.forEach((p) => {
    io.to(p.id).emit("privateState", {
      myHand: rs?.hands?.[p.id] || [],
      mySecretCards: rs?.secretCards?.[p.id] || [],
    });
  });
}

// ---------- Actions ----------
function consumeCard(rs, playerId, cardUid) {
  const hand = rs.hands[playerId] || [];
  const idx = hand.findIndex((c) => c.uid === cardUid);
  if (idx === -1) return { ok: false, error: "Card not found or already used" };
  const [card] = hand.splice(idx, 1);
  return { ok: true, card };
}

function applyAction(room, playerId, action) {
  const rs = room.roundState;
  if (!rs) return { ok: false, error: "Round not initialized" };

  const active = room.players[rs.currentTurn];
  if (!active || active.id !== playerId) return { ok: false, error: "Not your turn" };

  const { cardUid, type, targetTikiId } = action || {};
  if (!validateString(cardUid, 128)) return { ok: false, error: "Missing/invalid cardUid" };
  if (!["UP", "TOPPLE", "TOAST", "MAX"].includes(type)) {
    return { ok: false, error: "Invalid action type" };
  }

  const consumed = consumeCard(rs, playerId, cardUid);
  if (!consumed.ok) return consumed;
  const card = consumed.card;

  if (card.type !== type) return { ok: false, error: "Card/action mismatch" };

  if (card.type === "UP") {
    if (!Number.isInteger(targetTikiId)) return { ok: false, error: "UP needs target tiki" };
    const idx = rs.tikiOrder.indexOf(targetTikiId);
    if (idx === -1) return { ok: false, error: "Invalid target tiki" };

    const steps = Number(card.steps || 0);
    if (![1, 2, 3].includes(steps)) return { ok: false, error: "Invalid UP steps" };

    const newIdx = Math.max(0, idx - steps);
    rs.tikiOrder.splice(idx, 1);
    rs.tikiOrder.splice(newIdx, 0, targetTikiId);

  } else if (card.type === "TOPPLE") {
    if (!Number.isInteger(targetTikiId)) return { ok: false, error: "TOPPLE needs target tiki" };
    const idx = rs.tikiOrder.indexOf(targetTikiId);
    if (idx === -1) return { ok: false, error: "Invalid target tiki" };

    rs.tikiOrder.splice(idx, 1);
    rs.tikiOrder.push(targetTikiId);

  } else if (card.type === "TOAST") {
    if (!rs.hasAnyMove) return { ok: false, error: "Tiki Toast cannot be first move of round" };
    if (rs.tikiOrder.length <= 3) return { ok: false, error: "Cannot toast when only 3 tikis remain" };

    const removed = rs.tikiOrder.pop();
    rs.removedTikis.push(removed);

  } else if (card.type === "MAX") {
    if (!Number.isInteger(targetTikiId)) return { ok: false, error: "MAX needs target tiki" };
    const idx = rs.tikiOrder.indexOf(targetTikiId);
    if (idx === -1) return { ok: false, error: "Invalid target tiki" };

    rs.tikiOrder.splice(idx, 1);
    rs.tikiOrder.unshift(targetTikiId); // move directly to top
  }

  rs.hasAnyMove = true;

  // Round ends when only 3 tikis remain OR all cards used
  const allHandsEmpty = room.players.every((p) => (rs.hands[p.id] || []).length === 0);
  if (rs.tikiOrder.length === 3 || allHandsEmpty) {
    rs.ended = true;
  } else {
    rs.currentTurn = (rs.currentTurn + 1) % room.players.length;
  }

  return { ok: true };
}

// ---------- Scoring ----------
function scoreRound(room) {
  const rs = room.roundState;
  const top3 = rs.tikiOrder.slice(0, 3);
  const pos = new Map(top3.map((t, i) => [t, i + 1]));

  room.players.forEach((p) => {
    const secret = rs.secretCards[p.id] || [];
    let add = 0;
    secret.forEach((c) => {
      const rank = pos.get(c.tikiId);
      if (rank && rank <= c.needsTopN) add += c.points;
    });
    room.scoreboard[p.id] = (room.scoreboard[p.id] || 0) + add;
  });
}

function topScorers(room) {
  let best = -Infinity;
  room.players.forEach((p) => {
    best = Math.max(best, room.scoreboard[p.id] || 0);
  });
  return room.players.filter((p) => (room.scoreboard[p.id] || 0) === best).map((p) => p.id);
}

function finishRoundAndTransition(room) {
  scoreRound(room);

  // If final tie-break round, end game here
  if (room.isTieBreakerRound) {
    room.gameEnded = true;
    room.winnerIds = topScorers(room);
    return { gameEnded: true, tieBreakerStarted: false };
  }

  // Normal round progression
  if (room.currentRound < room.totalRounds) {
    room.currentRound += 1;
    room.roundStarterIndex = (room.roundStarterIndex + 1) % room.players.length;
    room.roundState = initRoundState(room);
    return { gameEnded: false, tieBreakerStarted: false };
  }

  // Scheduled rounds over -> tie check
  const tied = topScorers(room);
  if (tied.length >= 2) {
    room.isTieBreakerRound = true;
    room.currentRound += 1; // show as extra round
    room.roundStarterIndex = (room.roundStarterIndex + 1) % room.players.length;
    room.roundState = initRoundState(room);
    return { gameEnded: false, tieBreakerStarted: true };
  }

  room.gameEnded = true;
  room.winnerIds = tied;
  return { gameEnded: true, tieBreakerStarted: false };
}

// ---------- Room remove ----------
function removeFromRoom(roomCode, socketId) {
  const room = rooms[roomCode];
  if (!room) return;

  const idx = room.players.findIndex((p) => p.id === socketId);
  if (idx === -1) return;

  const leaving = room.players[idx];
  room.players.splice(idx, 1);
  delete room.scoreboard[leaving.id];

  if (room.hostId === leaving.id) room.hostId = room.players[0]?.id || null;

  if (room.players.length === 0) {
    delete rooms[roomCode];
    return;
  }

  if (room.gameStarted && !room.gameEnded) {
    room.gameEnded = true;
    room.winnerIds = [];
  }

  io.to(roomCode).emit("updateState", publicState(room));
}

// ---------- Socket ----------
io.on("connection", (socket) => {
  socket.on("createRoom", safeHandler("createRoom", ({ name, maxPlayers = 4 }, cb) => {
    if (!validateString(name, 24)) return safeCb(cb, { ok: false, error: "Invalid name" });
    if (!isValidPlayerCount(maxPlayers)) return safeCb(cb, { ok: false, error: "Invalid max players" });

    let code = genCode();
    while (rooms[code]) code = genCode();

    rooms[code] = {
      roomCode: code,
      hostId: socket.id,
      maxPlayers: Number(maxPlayers),
      players: [{ id: socket.id, name: name.trim() }],
      gameStarted: false,
      gameEnded: false,
      currentRound: 0,
      totalRounds: 0,
      isTieBreakerRound: false,
      roundStarterIndex: 0,
      roundState: null,
      scoreboard: { [socket.id]: 0 },
      winnerIds: [],
    };

    socket.join(code);
    socket.data.roomCode = code;

    safeCb(cb, { ok: true, roomCode: code, state: publicState(rooms[code]) });
  }));

  socket.on("joinRoom", safeHandler("joinRoom", ({ name, roomCode }, cb) => {
    if (!validateString(name, 24)) return safeCb(cb, { ok: false, error: "Invalid name" });
    if (!isValidRoomCode(roomCode)) return safeCb(cb, { ok: false, error: "Invalid room code" });

    const room = rooms[roomCode];
    if (!room) return safeCb(cb, { ok: false, error: "Room not found" });
    if (room.players.length >= room.maxPlayers) return safeCb(cb, { ok: false, error: "Room full" });
    if (room.gameStarted) return safeCb(cb, { ok: false, error: "Game already started" });

    if (room.players.some((p) => p.id === socket.id)) {
      return safeCb(cb, { ok: false, error: "Already in room" });
    }

    room.players.push({ id: socket.id, name: name.trim() });
    room.scoreboard[socket.id] = 0;

    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    io.to(roomCode).emit("updateState", publicState(room));
    safeCb(cb, { ok: true, roomCode, state: publicState(room) });
  }));

  socket.on("startGame", safeHandler("startGame", ({ roomCode }, cb) => {
    if (!isValidRoomCode(roomCode)) return safeCb(cb, { ok: false, error: "Invalid room code" });

    const room = rooms[roomCode];
    if (!room) return safeCb(cb, { ok: false, error: "Room not found" });
    if (room.hostId !== socket.id) return safeCb(cb, { ok: false, error: "Only host can start" });
    if (room.players.length < 2) return safeCb(cb, { ok: false, error: "Need at least 2 players" });

    room.gameStarted = true;
    room.gameEnded = false;
    room.currentRound = 1;
    room.totalRounds = roundCountByPlayers(room.players.length);
    room.isTieBreakerRound = false;
    room.roundStarterIndex = 0;
    room.winnerIds = [];
    room.players.forEach((p) => (room.scoreboard[p.id] = 0));
    room.roundState = initRoundState(room);

    io.to(roomCode).emit("updateState", publicState(room));
    emitPrivateState(room);
    safeCb(cb, { ok: true });
  }));

  socket.on("playerAction", safeHandler("playerAction", ({ roomCode, action }, cb) => {
    if (!isValidRoomCode(roomCode)) return safeCb(cb, { ok: false, error: "Invalid room code" });

    const room = rooms[roomCode];
    if (!room || !room.gameStarted || room.gameEnded) {
      return safeCb(cb, { ok: false, error: "Game not active" });
    }

    const inRoom = room.players.some((p) => p.id === socket.id);
    if (!inRoom) return safeCb(cb, { ok: false, error: "You are not in this room" });

    const out = applyAction(room, socket.id, action);
    if (!out.ok) return safeCb(cb, out);

    io.to(roomCode).emit("updateState", publicState(room));
    emitPrivateState(room);

    if (room.roundState.ended) {
      const revealSecretCards = room.roundState?.secretCards || {};
      const transition = finishRoundAndTransition(room);

      io.to(roomCode).emit("roundEnd", {
        state: publicState(room),
        gameEnded: transition.gameEnded,
        tieBreakerStarted: transition.tieBreakerStarted,
        revealSecretCards,
      });

      if (!transition.gameEnded) {
        io.to(roomCode).emit("updateState", publicState(room));
        emitPrivateState(room);
      }
    }

    safeCb(cb, { ok: true });
  }));

  socket.on("leaveRoom", safeHandler("leaveRoom", ({ roomCode }, cb) => {
    if (isValidRoomCode(roomCode)) {
      socket.leave(roomCode);
      removeFromRoom(roomCode, socket.id);
    }
    socket.data.roomCode = null;
    safeCb(cb, { ok: true });
  }));

  socket.on("disconnect", () => {
    try {
      const rc = socket.data.roomCode;
      if (rc) removeFromRoom(rc, socket.id);
    } catch (e) {
      console.error("disconnect handler error:", e);
    }
  });
});

// ---------- HTTP ----------
app.get("/", (_, res) => res.send("Tiki Topple server running"));
app.get("/health", (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

process.on("uncaughtException", (err) => {
  console.error("uncaughtException:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection:", reason);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
