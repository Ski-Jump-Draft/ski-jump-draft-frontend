"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname";
import { joinMatchmaking, leaveMatchmaking, JoinResponse, getMatchmaking } from "@/lib/matchmaking";
import { MatchmakingDialog } from "@/components/MatchmakingDialog";
import { useMatchmakingState } from "@/hooks/api_streams/useMatchmakingState";
import { TransitionScreen } from "@/components/TransitionScreen";
import { GameHillInfoScreen } from "@/components/GameHillInfoScreen";
import {
  GameCreatedEvent,
  HillChoiceEndedEvent,
  HillChoiceStartedEvent,
  PreDraftStartedEvent,
  useGameHubStream,
  GameHubEvent,
} from "@/hooks/api_streams/useGameHubStream";
import { Hill } from "@/types/game";

/* ───────────────────────────────────────────── */

export default function HomePage() {
  /* nickname */
  const [nick, setNick] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  useEffect(() => setPlaceholder(generateNickname()), []);

  /* matchmaking */
  const [matchId, setMatchmakingId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(0);
  const [status, setStatus] = useState<"idle" | "waiting" | "starting" | "failed">("idle");
  const [reason, setReason] = useState<string>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [endedAt, setEndedAt] = useState<number>(0);

  /* game-hub */
  const [gameHubId, setGameHubId] = useState<string | null>(null);

  /* fazy */
  const [gameCreated, setGameCreated] = useState<GameCreatedEvent | null>(null);
  const [hillStarted, setHillStarted] = useState<HillChoiceStartedEvent | null>(null);
  const [hillEnded, setHillEnded] = useState<HillChoiceEndedEvent | null>(null);
  const [hill, setHill] = useState<Hill | null>(null);
  const [preDraft, setPreDraft] = useState<PreDraftStartedEvent | null>(null);

  /* ekrany */
  const [screen, setScreen] = useState<"none" | "transition1" | "hill" | "transition2">("none");

  useMatchmakingState(matchId, s => {
    setCurrent(s.playersCount);
    setMax(s.maxPlayers ?? 0);

    if (s.status === "Running") {
      setStatus("waiting");
    } else if (s.status === "Ended") {
      setStatus("starting");
      setEndedAt(Date.now());
      setGameHubId(matchId);
      const t = setTimeout(() => {
        setDialogOpen(false);
        setScreen("transition1");
        setMatchmakingId(null);
      }, 2000);
      return () => clearTimeout(t);
    } else if (s.status === "Failed") {
      setStatus("failed");
      setReason(s.failReason ?? undefined);
    }
  });

  /* ── 2. gameHub ── */
  useGameHubStream(gameHubId, (ev: GameHubEvent) => {
    switch (ev.type) {
      case "gameCreated":
        setGameCreated(ev);
        break;

      case "hillChoiceStarted":
        setHillStarted(ev);
        setHill(ev.hill);
        break;

      case "hillChoiceEnded":
        setHillEnded(ev);
        break;

      case "preDraftStarted": {
        setPreDraft(ev);
        setScreen("none");          // tu wejdzie PreDraftScreen (dalej)
        break;
      }
    }
  });

  /* ── 3. harmonogram ekranów ── */
  useEffect(() => {
    if (screen === "transition1" && gameCreated) {
      const delta = new Date(gameCreated.scheduledNextPhaseAtUtc).getTime() - Date.now();
      const ms = Math.max(0, delta);                       // nie pozwól na ujemny
      const t = setTimeout(() => setScreen("hill"), ms);
      return () => clearTimeout(t);
    }
  }, [screen, gameCreated]);

  useEffect(() => {
    if (screen === "hill" && hillEnded) setScreen("transition2");
  }, [screen, hillEnded]);

  /* ── 4. ZAGRAJ ── */
  const submit = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const nickSend = (nick.trim() || placeholder).slice(0, 24);
      const info: JoinResponse = await joinMatchmaking(nickSend);
      console.log(info.matchmakingId);
      setMatchmakingId(info.matchmakingId);
      setPlayerId(info.playerId);

      const snapshot = await getMatchmaking(info.matchmakingId);
      setCurrent(snapshot.playersCount);
      setMax(snapshot.maxPlayers);
      setStatus(snapshot.status === "Running" ? "waiting" : snapshot.status.toLowerCase() as any);
      setDialogOpen(true);

    } catch {
      alert("Nie udało się dołączyć do matchmakingu.");
    } finally {
      setBusy(false);
    }
  }, [busy, nick, placeholder]);

  /* ── 5. PRZERWIJ ── */
  const abort = useCallback(async () => {
    if (matchId && playerId) {
      try { await leaveMatchmaking(matchId, playerId); } catch { }
    }
    hardReset();
  }, [matchId, playerId]);

  const hardReset = () => {
    setMatchmakingId(null); setPlayerId(null); setGameHubId(null);
    setCurrent(0); setMax(0);
    setStatus("idle"); setReason(undefined);
    setDialogOpen(false); setBusy(false);
    setEndedAt(0); setGameCreated(null);
    setHillStarted(null); setHillEnded(null); setHill(null);
    setPreDraft(null); setScreen("none");
  };

  /* ── UI ── */
  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden font-sans">
      {/* bg */}
      <div className="absolute inset-0 -z-10 bg-cover bg-center opacity-100 dark:opacity-30"
        style={{ backgroundImage: "url('/assets/predazzo_4k.jpeg')" }} />

      {/* karta startowa */}
      <div className="flex flex-col items-center gap-8 rounded-3xl border border-white/20
                      bg-gray-800/100 dark:bg-stone-900/100 p-10 shadow-xl backdrop-blur-md">
        <h1 className="font-heading text-5xl font-bold text-white">SJ Draft</h1>
        <p className="text-center text-white/80 max-w-md">
          Obserwuj skoki zawodników i skompletuj najlepszy skład ze wszystkich! Rozgrywka trwa około 15 minut.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Input placeholder={placeholder} value={nick}
            onChange={e => setNick(e.target.value)}
            disabled={busy || status !== "idle"} />
          <Button disabled={busy || status !== "idle"} onClick={submit}>
            {busy ? "Łączenie…" : "Zagraj"}
          </Button>
        </div>

        <MatchmakingDialog
          open={dialogOpen}
          current={current}
          max={max}
          status={status === "starting" ? "starting" : status === "failed" ? "failed" : "waiting"}
          reason={reason}
          onCancel={abort}
        />
      </div>

      {/* full-screen overlay */}
      <TransitionScreen
        visible={screen === "transition1" && !!gameCreated}
        phases={PHASES} currentIndex={0}
        targetUtc={gameCreated?.scheduledNextPhaseAtUtc ?? null}
      />

      {screen === "hill" && hill && hillStarted && (
        <GameHillInfoScreen
          //visible
          hill={hill}
          targetUtc={hillStarted.scheduledNextPhaseAtUtc}
        />
      )}

      <TransitionScreen
        visible={screen === "transition2" && !!hillEnded}
        phases={PHASES} currentIndex={1}
        targetUtc={hillEnded?.scheduledNextPhaseAtUtc ?? null}
      />
    </main>
  );
}

/* listy faz */
const PHASES = [
  { title: "Wybór skoczni", description: "Gdzie dziś skaczemy? Mamut w Vikersund, skocznia olimpijska, a może malutkie Hinzenbach?" },
  { title: "Obserwacja", description: "Przyjrzyj się formie zawodników... Za chwilę wybierasz!" },
  { title: "Draft", description: "Wybierz swój dream-team na konkurs. Postawisz na sensację kwalifikacji, czy na sprawdzonych liderów swoich kadr?" },
  { title: "Konkurs", description: "Czy przeczucie było trafne? Zaraz się okaże!" },
];
