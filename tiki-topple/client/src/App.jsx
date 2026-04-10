import { useEffect, useState } from "react";
import { socket } from "./socket";
import Home from "./components/Home";
import Lobby from "./components/Lobby";
import GameBoard from "./components/GameBoard";
import ScoreScreen from "./components/ScoreScreen";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [state, setState] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [moveMsg, setMoveMsg] = useState("");

  const [myHand, setMyHand] = useState([]);
  const [mySecretCards, setMySecretCards] = useState([]);
  const [revealedSecrets, setRevealedSecrets] = useState({});

  const myId = socket.id;

  useEffect(() => {
    socket.on("updateState", (s) => {
    setState(s);
    if (!s.gameStarted) setScreen("lobby");
    else if (s.gameEnded) setScreen("score");
    else if (s.round) setScreen("game");
    });

    socket.on("privateState", (p) => {
      setMyHand(p?.myHand || []);
      setMySecretCards(p?.mySecretCards || []);
    });

    socket.on("roundEnd", ({ state: s, gameEnded, revealSecretCards }) => {
      setState(s);
      setRevealedSecrets(revealSecretCards || {});
      setScreen("score");
      if (gameEnded) return;
    });

    return () => {
      socket.off("updateState");
      socket.off("privateState");
      socket.off("roundEnd");
    };
  }, []);

  const createRoom = (name, maxPlayers) => {
    setError("");
    if (!name) return setError("Please enter your name");
    setLoading(true);

    socket.emit("createRoom", { name, maxPlayers }, (res) => {
      setLoading(false);
      if (!res.ok) return setError(res.error || "Create failed");
      setState(res.state);
      setRoomCode(res.roomCode);
      setScreen("lobby");
    });
  };

  const joinRoom = (name, code) => {
    setError("");
    if (!name) return setError("Please enter your name");
    if (!code) return setError("Please enter room code");
    setLoading(true);

    socket.emit("joinRoom", { name, roomCode: code }, (res) => {
      setLoading(false);
      if (!res.ok) return setError(res.error || "Join failed");
      setState(res.state);
      setRoomCode(code);
      setScreen("lobby");
    });
  };

  const startGame = () => {
    socket.emit("startGame", { roomCode }, (res) => {
      if (!res.ok) setError(res.error || "Cannot start");
    });
  };

  const playAction = (action) => {
    setMoveMsg("");
    socket.emit("playerAction", { roomCode, action }, (res) => {
      if (!res.ok) setMoveMsg(res.error || "Invalid move");
    });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomCode }, () => {
      setScreen("home");
      setState(null);
      setRoomCode("");
      setError("");
      setMoveMsg("");
      setMyHand([]);
      setMySecretCards([]);
      setRevealedSecrets({});
    });
  };

  if (screen === "home") return <Home onCreate={createRoom} onJoin={joinRoom} loading={loading} error={error} />;
  if (screen === "lobby" && state) return <Lobby state={state} myId={myId} onStart={startGame} onLeave={leaveRoom} />;

  if (screen === "game" && state) {
    return (
      <GameBoard
        state={state}
        myId={myId}
        myHand={myHand}
        mySecretCards={mySecretCards}
        onPlay={playAction}
        onLeave={leaveRoom}
        message={moveMsg}
      />
    );
  }

  if (screen === "score" && state) {
    return (
      <ScoreScreen
        state={state}
        myId={myId}
        mySecretCards={mySecretCards}
        revealedSecrets={revealedSecrets}
        onContinue={() => {
          if (state.gameEnded) leaveRoom();
          else setScreen("game");
        }}
      />
    );
  }

  return null;
}