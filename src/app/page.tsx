"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname";
import { joinMatchmaking, leaveMatchmaking, JoinResponse, getMatchmaking, JoinError } from "@/lib/matchmaking";
import { MatchmakingDialog } from "@/components/MatchmakingDialog";
import { useMatchmakingState } from "@/hooks/api_streams/useMatchmakingState";
import { TransitionScreen } from "@/components/TransitionScreen";
import { GameHillInfoScreen } from "@/components/GameHillInfoScreen";
import {
  GameUpdatedEvent,
  GameEndedEvent,
  useGameHubStream,
  GameHubEvent,
} from "@/hooks/api_streams/useGameHubStream";
// import { useMatchmakingSignalR, GameStartedAfterMatchmakingEvent, MatchmakingSignalREvent } from "@/hooks/api_streams/useMatchmakingSignalR";
import { GameUpdatedDto, GameStatus } from "@/types/game";

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
  const [joinError, setJoinError] = useState<JoinError | null>(null);

  /* game-hub */
  const [gameHubId, setGameHubId] = useState<string | null>(null);
  const [gameData, setGameData] = useState<GameUpdatedDto | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [waitingForGameStart, setWaitingForGameStart] = useState(false);

  /* ekrany */
  const [screen, setScreen] = useState<"none" | "transition1" | "hill" | "transition2" | "predraft" | "draft" | "competition" | "ended">("none");

  useMatchmakingState(matchId, s => {
    setCurrent(s.playersCount);
    setMax(s.maxPlayers);

    if (s.status === "Running") {
      setStatus("waiting");
    } else if (s.status === "Ended Succeeded") {
      setStatus("starting");
      setEndedAt(Date.now());
      setWaitingForGameStart(true);
      // Don't set gameHubId here - wait for GameStartedAfterMatchmaking event
      const t = setTimeout(() => {
        setDialogOpen(false);
        setScreen("transition1");
        // Don't set matchmakingId to null here - keep it for SignalR
      }, 2000);
      return () => clearTimeout(t);
    } else if (s.status === "Ended NotEnoughPlayers" || s.status === "Failed") {
      setStatus("failed");
      setReason(s.failReason ?? (s.status === "Ended NotEnoughPlayers" ? "Not enough players" : "Matchmaking failed"));
    }
  });

  /* ── 2. matchmaking SignalR ── */
  // Now handled by useGameHubStream with matchmakingId

  // Debug logging - removed spam

  /* ── 3. gameHub ── */
  useGameHubStream(
    gameHubId || (waitingForGameStart ? null : null),  // Use gameHubId if available, otherwise matchmaking
    (ev: GameHubEvent) => {
      switch (ev.type) {
        case "gameUpdated":
          setGameData(ev.data);
          setGameStatus(ev.data.status);

          // Clear matchmakingId after receiving first GameUpdated, but only if we have gameHubId
          if (matchId && !gameHubId) {
            console.log('🎮 Game started, switching to game mode');
            setGameHubId(ev.data.gameId);
            setMatchmakingId(null);
            setWaitingForGameStart(false);
          }

          // If we have nextStatus, stay on transition screen and let timer handle the switch
          // But if nextStatus.status is the same as current status, we're already in the right phase
          if (ev.data.nextStatus && ev.data.nextStatus.status !== ev.data.status) {
            // Don't change screen yet - let the timer handle it
          } else {
            // No nextStatus, switch immediately based on game status
            switch (ev.data.status) {
              case "PreDraft":
                setScreen("predraft");
                break;
              case "Draft":
                setScreen("draft");
                break;
              case "MainCompetition":
                setScreen("competition");
                break;
              case "Ended":
                setScreen("ended");
                break;
              case "Break":
                // Handle break state if needed
                break;
            }
          }
          break;

        case "gameEnded":
          console.log('Game ended:', ev.gameId);
          setScreen("ended");
          break;

        case "gameStartedAfterMatchmaking":
          // DON'T change anything yet - keep the same connection!
          // Just switch from matchmaking to game group in the same connection
          // We'll clear matchmakingId after receiving the first GameUpdated
          break;
      }
    }, gameHubId ? null : (waitingForGameStart ? matchId : null));

  /* ── 3. harmonogram ekranów ── */
  // Now handled by game status updates from SignalR

  // Removed fetchCurrentGameState - using SignalR only

  /* ── 4. ZAGRAJ ── */
  const submit = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setJoinError(null); // Clear previous errors

    try {
      const nickSend = (nick.trim() || placeholder).slice(0, 24);
      const info: JoinResponse = await joinMatchmaking(nickSend);
      console.log(info.matchmakingId);
      setMatchmakingId(info.matchmakingId);
      setPlayerId(info.playerId);

      const snapshot = await getMatchmaking(info.matchmakingId);
      setCurrent(snapshot.playersCount);
      setMax(snapshot.maxPlayers);

      // Map new statuses to old UI statuses
      let uiStatus: "idle" | "waiting" | "starting" | "failed" = "waiting";
      if (snapshot.status === "Running") {
        uiStatus = "waiting";
      } else if (snapshot.status === "Ended Succeeded") {
        uiStatus = "starting";
      } else if (snapshot.status === "Ended NotEnoughPlayers" || snapshot.status === "Failed") {
        uiStatus = "failed";
      }

      setStatus(uiStatus);
      setDialogOpen(true);

    } catch (error) {
      if (error && typeof error === 'object' && 'error' in error) {
        // This is a JoinError from our API
        setJoinError(error as JoinError);
      } else {
        // Generic error
        setJoinError({
          error: 'ServerError',
          message: 'Nie udało się dołączyć do matchmakingu. Spróbuj ponownie.'
        });
      }
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
    setEndedAt(0);
    setGameData(null); setGameStatus(null);
    setWaitingForGameStart(false);
    setJoinError(null);
    setScreen("none");
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
        <h1 className="font-heading text-5xl font-bold text-white">Ski Jump Draft</h1>
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

        {/* Error display */}
        {joinError && (
          <div className="mt-4 p-4 rounded-lg border border-red-500/50 bg-red-500/10 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold text-sm mb-1">
                  {joinError.error === 'MultipleGamesNotSupported' && 'Gra już trwa'}
                  {joinError.error === 'AlreadyJoined' && 'Już dołączyłeś'}
                  {joinError.error === 'RoomIsFull' && 'Pokój pełny'}
                  {joinError.error === 'ServerError' && 'Błąd serwera'}
                </h3>
                <p className="text-red-300 text-sm">{joinError.message}</p>
              </div>
              <button
                onClick={() => setJoinError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <MatchmakingDialog
          open={dialogOpen}
          current={current}
          max={max}
          status={status === "starting" ? "starting" : status === "failed" ? "failed" : "waiting"}
          reason={reason}
          onCancel={abort}
        />
      </div>

      {/* Transition screens */}
      <TransitionScreen
        visible={screen === "transition1"}
        phases={PHASES}
        currentIndex={0}
        targetUtc={null}
        nextStatus={gameData?.nextStatus}
      />

      <TransitionScreen
        visible={screen === "transition2"}
        phases={PHASES}
        currentIndex={1}
        targetUtc={null}
        nextStatus={gameData?.nextStatus}
      />

      {/* Game screens based on status */}
      {screen === "predraft" && gameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">PreDraft Phase</h2>
            <p>Competition {(gameData.preDraft?.index ?? 0) + 1} of {gameData.preDraftsCount}</p>
            {gameData.preDraft?.competition && (
              <p>Status: {gameData.preDraft.competition.status}</p>
            )}
          </div>
        </div>
      )}

      {screen === "draft" && gameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Draft Phase</h2>
            <p>Order: {gameData.draft?.orderPolicy}</p>
            {gameData.draft?.currentPlayerId && (
              <p>Current player turn</p>
            )}
          </div>
        </div>
      )}

      {screen === "competition" && gameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Main Competition</h2>
            <p>Status: {gameData.mainCompetition?.status}</p>
            {gameData.mainCompetition?.nextJumperId && (
              <p>Next jumper to jump</p>
            )}
          </div>
        </div>
      )}

      {screen === "ended" && gameData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Game Ended</h2>
            <p>Policy: {gameData.ended?.policy}</p>
            <p>Final rankings available</p>
          </div>
        </div>
      )}
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
