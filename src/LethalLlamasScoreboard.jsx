import { useState } from "react";

// --- Simple preset llama SVGs (no uploads, no config) ---
const AngryLlamaFace = ({ color = "#f97316" }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 64 64"
    fill="none"
    className="mr-2"
  >
    {/* Ears */}
    <path d="M18 6c-4 10 0 16 2 18" stroke={color} strokeWidth="6" strokeLinecap="round" />
    <path d="M46 6c4 10 0 16-2 18" stroke={color} strokeWidth="6" strokeLinecap="round" />

    {/* Head */}
    <ellipse cx="32" cy="38" rx="20" ry="18" fill={color} />

    {/* Angry eyebrows */}
    <path
      d="M18 28l14 6"
      stroke="#000"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M46 28l-14 6"
      stroke="#000"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Eyes */}
    <circle cx="26" cy="34" r="2.5" fill="#000" />
    <circle cx="38" cy="34" r="2.5" fill="#000" />

    {/* Snout */}
    <ellipse cx="32" cy="44" rx="8" ry="6" fill="#fed7aa" />

    {/* Nostrils */}
    <circle cx="29" cy="45" r="1" fill="#000" />
    <circle cx="35" cy="45" r="1" fill="#000" />

    {/* Air / steam from nose */}
    <path
      d="M20 44c-6-2-8-6-6-10"
      stroke="#e5e7eb"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M44 44c6-2 8-6 6-10"
      stroke="#e5e7eb"
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Angry mouth */}
    <path
      d="M24 44c4 6 12 6 16 0"
      stroke="#000"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);


export default function LethalLlamasScoreboard() {
  const [stage, setStage] = useState("start");
  const [mode, setMode] = useState(null);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [maxWTF, setMaxWTF] = useState(0);
  const [wtfA, setWtfA] = useState(0);
  const [wtfB, setWtfB] = useState(0);
  const [round, setRound] = useState(1);
  const [history, setHistory] = useState([]);
  const [deltaA, setDeltaA] = useState(0);
  const [deltaB, setDeltaB] = useState(0);
  const [confirmExit, setConfirmExit] = useState(false);

  const startGame = (selectedMode) => {
    const total = selectedMode === "3v3" ? 300 : 200;
    setMode(selectedMode);
    setMaxWTF(total);
    setWtfA(total);
    setWtfB(total);
    setRound(1);
    setHistory([]);
    setDeltaA(0);
    setDeltaB(0);
    setStage("setup");
  };

  const beginMatch = () => {
    if (!teamA || !teamB) return;
    setStage("game");
  };

  const healthColor = (value) => {
    const pct = value / maxWTF;
    if (pct > 0.5) return "bg-lime-400";
    if (pct > 0.25) return "bg-yellow-400";
    return "bg-red-500";
  };

  const applyDelta = (current, delta) =>
    Math.min(Math.max(current + delta, 0), maxWTF);

  const submitRound = () => {
    if (round > 10 || wtfA === 0 || wtfB === 0) return;

    const newA = applyDelta(wtfA, deltaA);
    const newB = applyDelta(wtfB, deltaB);

    setHistory([
      ...history,
      { round, deltaA, deltaB, wtfA: newA, wtfB: newB },
    ]);

    setWtfA(newA);
    setWtfB(newB);

    if (round === 10 || newA === 0 || newB === 0) {
      setStage("end");
    } else {
      setRound(round + 1);
    }

    setDeltaA(0);
    setDeltaB(0);
  };

  const editRound = (index) => {
    const prevA = index === 0 ? maxWTF : history[index - 1].wtfA;
    const prevB = index === 0 ? maxWTF : history[index - 1].wtfB;

    setWtfA(prevA);
    setWtfB(prevB);
    setRound(history[index].round);
    setHistory(history.slice(0, index));
    setStage("game");
  };

  const dropdownValues = Array.from(
    { length: maxWTF * 2 / 5 + 1 },
    (_, i) => i * 5 - maxWTF
  );

  const resetToStart = () => {
    setConfirmExit(false);
    setStage("start");
    setTeamA("");
    setTeamB("");
    setHistory([]);
    setRound(1);
  };

  // --- Winner logic (unchanged behavior, restored) ---
  const lastRound = history[history.length - 1];
  let winner = "";

  if (wtfA === 0 && wtfB === 0 && lastRound) {
    const dmgA = Math.abs(Math.min(lastRound.deltaA, 0));
    const dmgB = Math.abs(Math.min(lastRound.deltaB, 0));
    if (dmgA === dmgB) winner = "Tie";
    else winner = dmgA < dmgB ? teamA : teamB;
  } else if (wtfA === wtfB) winner = "Tie";
  else winner = wtfA < wtfB ? teamB : teamA;

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-center">Lethal Llamas</h1>

      {stage === "start" && (
        <button onClick={() => setStage("mode")} className="bg-purple-600 rounded-2xl py-4 text-xl">
          Start New Game
        </button>
      )}

      {stage === "mode" && (
        <div className="flex flex-col gap-4">
          <button onClick={() => startGame("2v2")} className="bg-blue-600 rounded-2xl py-4">2 vs 2 (200 WTF)</button>
          <button onClick={() => startGame("3v3")} className="bg-red-600 rounded-2xl py-4">3 vs 3 (300 WTF)</button>
        </div>
      )}

      {stage === "setup" && (
        <div className="flex flex-col gap-3">
          <input placeholder="Team A name" value={teamA} onChange={(e) => setTeamA(e.target.value)} className="p-3 rounded-xl text-black" />
          <input placeholder="Team B name" value={teamB} onChange={(e) => setTeamB(e.target.value)} className="p-3 rounded-xl text-black" />
          <button onClick={beginMatch} className="bg-green-500 rounded-2xl py-3">Begin Match</button>
        </div>
      )}

      {(stage === "game" || stage === "end") && (
        <>
          <div className="text-center text-sm opacity-80">Round {round} / 10 • {mode}</div>

          {[{ name: teamA, value: wtfA, icon: <AngryLlamaFace color="#f8f128ff" /> }, { name: teamB, value: wtfB, icon: <AngryLlamaFace /> }].map((team, i) => (
            <div key={i}>
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="flex items-center">{team.icon}{team.name}</span>
                <span>{team.value} WTF</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-4">
                <div className={`${healthColor(team.value)} h-4 rounded-full transition-all duration-500`} style={{ width: `${(team.value / maxWTF) * 100}%` }} />
              </div>
            </div>
          ))}
        </>
      )}

      {stage === "game" && (
        <div className="bg-black/20 rounded-2xl p-4 flex flex-col gap-2">
          <h2 className="text-center font-bold">Round {round}</h2>

          <label>{teamA}</label>
          <select value={deltaA} onChange={(e) => setDeltaA(Number(e.target.value))} className="p-2 rounded text-black">
            {dropdownValues.map((v) => <option key={v} value={v}>{v >= 0 ? `+${v}` : v}</option>)}
          </select>

          <label>{teamB}</label>
          <select value={deltaB} onChange={(e) => setDeltaB(Number(e.target.value))} className="p-2 rounded text-black">
            {dropdownValues.map((v) => <option key={v} value={v}>{v >= 0 ? `+${v}` : v}</option>)}
          </select>

          <button onClick={submitRound} className="bg-purple-600 rounded-xl py-2 mt-2">Submit Round</button>
        </div>
      )}

      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">Round History</h3>
          {history.map((h, i) => (
            <div key={i} className="bg-black/30 rounded-xl p-2 flex justify-between">
              <span>R{h.round}: {h.deltaA >= 0 ? `+${h.deltaA}` : h.deltaA} / {h.deltaB >= 0 ? `+${h.deltaB}` : h.deltaB}</span>
              <button onClick={() => editRound(i)} className="underline text-sm">Edit</button>
            </div>
          ))}
        </div>
      )}

      {stage === "end" && (
        <div className="bg-black/30 rounded-2xl p-6 text-center flex flex-col gap-3">
          <h2 className="text-2xl font-bold">Game Over</h2>
          <p className="text-lg">Winner: <strong>{winner}</strong></p>
          <button onClick={() => setStage("mode")} className="bg-purple-600 rounded-xl py-2">New Game</button>
          <button onClick={() => { setWtfA(maxWTF); setWtfB(maxWTF); setRound(1); setHistory([]); setStage("game"); }} className="bg-green-600 rounded-xl py-2">Rematch</button>
        </div>
      )}

      {(stage === "game" || stage === "end") && (
        <div className="fixed bottom-0 left-0 w-full bg-black/80 p-4">
          {!confirmExit ? (
            <button onClick={() => setConfirmExit(true)} className="w-full bg-red-600 rounded-xl py-2">Exit Game</button>
          ) : (
            <div className="flex gap-3">
              <button onClick={resetToStart} className="flex-1 bg-red-600 rounded-xl py-2">Yes, Exit</button>
              <button onClick={() => setConfirmExit(false)} className="flex-1 bg-gray-600 rounded-xl py-2">Cancel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
