"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname";
import { joinMatchmaking, leaveMatchmaking, JoinResponse, getMatchmaking, JoinError } from "@/lib/matchmaking";
import { MatchmakingDialog } from "@/components/MatchmakingDialog";
import { useMatchmakingState } from "@/hooks/api_streams/useMatchmakingState";
import { TransitionScreen } from "@/components/TransitionScreen";
import { GameHillInfoScreen } from "@/components/GameHillInfoScreen";
import { PreDraftDemo } from "@/components/PreDraftDemo";
import { PreDraftScreen } from "@/components/PreDraftScreen";
import { DraftScreen } from "@/components/draft/DraftScreen";
import { DraftDemo } from "@/components/draft/DraftDemo";
import { DraftBreakDemo } from "@/components/draft/DraftBreakDemo";
import { mapGameDataToPreDraftProps } from "@/lib/gameMapper";
import { fisToAlpha2 } from "@/utils/countryCodes";
import {
  GameUpdatedEvent,
  GameEndedEvent,
  useGameHubStream,
  GameHubEvent,
} from "@/hooks/api_streams/useGameHubStream";
// import { useMatchmakingSignalR, GameStartedAfterMatchmakingEvent, MatchmakingSignalREvent } from "@/hooks/api_streams/useMatchmakingSignalR";
import { GameUpdatedDto, GameStatus } from "@/types/game";
import { Toaster, toast } from 'sonner';
import { GameEndedDemo } from "@/components/GameEndedDemo";
import { GameEndedScreen } from "@/components/GameEndedScreen";
import { MainCompetitionScreen } from "@/components/main-competition/MainCompetitionScreen";
import { MainCompetitionDemo } from "@/components/main-competition/MainCompetitionDemo";

/* ───────────────────────────────────────────── */

export default function HomePage() {
  const abortedByUserRef = useRef(false);
  /* nickname */
  const [nick, setNick] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  useEffect(() => setPlaceholder(generateNickname()), []);

  /* matchmaking */
  const [matchmakingId, setMatchmakingId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerNick, setPlayerNick] = useState<string | null>(null);
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
  const [screen, setScreen] = useState<'none' | 'transition1' | 'hill' | 'transition2' | 'predraft' | 'draft' | 'ended' | 'main-competition'>('none');
  const [isDemo, setIsDemo] = useState(false);
  const [preDraftEndedAt, setPreDraftEndedAt] = useState<number | null>(null);
  const [showDraftDemo, setShowDraftDemo] = useState(false);
  const [showDraftBreakDemo, setShowDraftBreakDemo] = useState(false);
  const [showPreDraftDemo, setShowPreDraftDemo] = useState(false);
  const [showGameEndedDemo, setShowGameEndedDemo] = useState(false);
  const [showMainCompetitionDemo, setShowMainCompetitionDemo] = useState(false);
  const [myDraftedJumperIds, setMyDraftedJumperIds] = useState<string[]>([]);

  // Helper: support backend ranking serialized as { Position, Points }
  const readRankingTuple = (value: unknown): [number, number] => {
    if (Array.isArray(value)) {
      return [Number(value[0] ?? 0), Number(value[1] ?? 0)];
    }
    if (value && typeof value === 'object') {
      const v = value as Record<string, unknown>;
      // Backend sends { position: number, points: number } (lowercase)
      const pos = Number(v.position ?? v.Position ?? 0);
      const pts = Number(v.points ?? v.Points ?? 0);
      return [pos, pts];
    }
    return [0, 0];
  };

  // Persist my draft picks when draft data is available
  useEffect(() => {
    if (gameData?.draft?.picks && playerId) {
      const myPicks = gameData.draft.picks.find(p => p.playerId === playerId)?.jumperIds;
      if (myPicks) {
        setMyDraftedJumperIds(myPicks);
      }
    }
  }, [gameData?.draft?.picks, playerId]);

  // Handle 5-second countdown after pre-draft ends
  useEffect(() => {
    if (preDraftEndedAt) {
      console.log("5-second countdown started after pre-draft ended");
      const timer = setTimeout(() => {
        console.log("5-second countdown completed, switching to draft screen");
        setScreen("draft");
        setPreDraftEndedAt(null);
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [preDraftEndedAt]);

  // Handle screen transitions based on nextStatus timer
  useEffect(() => {
    if (gameData?.nextStatus) {
      const timeSpan = gameData.nextStatus.in;
      const parts = timeSpan.split(':');
      const seconds = parseInt(parts[2], 10);

      if (seconds === 0) {
        // Timer reached 0, switch to next phase
        switch (gameData.nextStatus.status) {
          case "Draft":
            setScreen("draft");
            break;
          case "PreDraft":
            setScreen("predraft");
            break;
          case "MainCompetition":
            setScreen("main-competition");
            break;
          case "Ended":
            setScreen("ended");
            break;
        }
      }
    }
  }, [gameData?.nextStatus]);

  useMatchmakingState(matchmakingId, s => {
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
    null,  // Force single-connection mode: use matchmakingId only and switch groups internally
    (ev: GameHubEvent) => {
      switch (ev.type) {
        case "gameUpdated":
          setGameData(ev.data);
          setGameStatus(ev.data.status);

          // Clear matchmakingId after receiving first GameUpdated, but only if we have gameHubId
          // This is the signal that game has started and we received first game data
          if (matchmakingId) {
            // Stay on the same SignalR connection; do not switch to a new game connection here
            setWaitingForGameStart(false);

            // Update playerId to game player ID after matchmaking
            if (playerNick && ev.data.header?.players) {
              const gamePlayer = ev.data.header.players.find(p => p.nick === playerNick);
              if (gamePlayer) {
                setPlayerId(gamePlayer.playerId);
                console.log("Updating playerId from matchmaking to game:", gamePlayer.playerId);
              }
            }
          }

          // Handle screen switching based on game status
          // First, check for `nextStatus` to handle timed transitions
          // If we have nextStatus, stay on transition screen and let timer handle the switch
          // But if nextStatus.status is the same as current status, we're already in the right phase
          if (ev.data.nextStatus && ev.data.nextStatus.status !== ev.data.status && ev.data.status !== 'Break Ended' && ev.data.status !== 'Break PreDraft' && ev.data.nextStatus.status !== 'PreDraftNextCompetition') {
            // Don't change screen yet - let the timer handle it
            setScreen("transition1");
          } else {
            // No nextStatus, switch immediately based on game status
            switch (ev.data.status) {
              case "PreDraft":
                // Only show predraft if we have active competition data
                if (ev.data.preDraft?.competition) {
                  setScreen("predraft");
                }
                // If pre-draft ended but we have preDraftEndedAt, stay on predraft screen for 5 seconds
                // The useEffect will handle switching to draft after 5 seconds
                break;
              case "Break Draft":
                // Stay on predraft screen with timer to draft, if we have preDraftEndedAt set
                if (preDraftEndedAt !== null) {
                  console.log("Break Draft status received, staying on predraft screen for 5-sec countdown");
                  setScreen("predraft");
                } else {
                  console.log("Break Draft status received, but no 5-sec countdown active - switching to draft");
                  setScreen("draft");
                }
                break;
              case "Draft":
                setScreen("draft");
                break;
              case "MainCompetition":
              case "Break MainCompetition":
                setScreen("main-competition");
                break;
              case "Break Ended":
                setScreen("main-competition"); // Stay on main competition screen
                break;
              case "Ended":
                setScreen("ended");
                // Gracefully disconnect from SignalR
                abortedByUserRef.current = true;
                // No need for hardReset() here, as changing matchmakingId to null in useGameHubStream will trigger disconnection
                break;
              case "Break PreDraft":
                // Stay on predraft screen during break between pre-draft competitions
                setScreen("predraft");
                break;
              case "Break":
                // Generic break - check next status
                if (ev.data.nextStatus?.status === "PreDraft") {
                  setScreen("predraft");
                } else if (ev.data.nextStatus?.status === "Draft") {
                  setScreen("draft");
                } else if (ev.data.nextStatus?.status === "MainCompetition") {
                  setScreen("main-competition");
                }
                break;
              default:
                setScreen("none");
                break;
            }
          }

          // Detect pre-draft ending - when status changes to "Break Draft" and we have lastCompetitionState
          if (ev.data.status === "Break Draft" && ev.data.lastCompetitionState && preDraftEndedAt === null) {
            console.log("Pre-draft ended, starting 5-second delay. Status:", ev.data.status, "Results:", ev.data.lastCompetitionState.results.length);
            setPreDraftEndedAt(Date.now());
            setScreen("predraft"); // Ensure we're on predraft screen for the 5-second countdown
          }

          // Show/keep draft results view during Break MainCompetition
          if (ev.data.status === "Break MainCompetition" && ev.data.draft !== null) {
            setScreen('draft');
            break;
          }

          break;

        case "gameEnded":
          setScreen("ended");
          // Gracefully disconnect from SignalR
          abortedByUserRef.current = true;
          break;

        case "gameStartedAfterMatchmaking":
          // DON'T change anything yet - keep the same connection!
          // Just switch from matchmaking to game group in the same connection
          // We'll clear matchmakingId after receiving the first GameUpdated
          break;
      }
    },
    matchmakingId,
    () => {
      // Connection lost handler
      if (abortedByUserRef.current) {
        // Suppress toast when user intentionally cancelled matchmaking
        abortedByUserRef.current = false;
        return;
      }
      console.log('Connection lost - returning to main menu');
      toast.error("Utracono połączenie z serwerem.", {
        style: {
          backgroundColor: '#440000', // Darker red background
          color: '#ffcccc',       // Lighter red text
          borderColor: '#ff0000',  // Red border
          maxWidth: '400px',      // Limit width
        },
        duration: 5000, // Make it visible for a longer time
      });
      hardReset(); // This will clear matchmakingId and stop the connection
    }
  );

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
      setMatchmakingId(info.matchmakingId);
      setPlayerId(info.playerId);
      setPlayerNick(info.correctedNick);
      // setShouldConnectToGameHub(true); // REMOVED - connection will start because matchmakingId is set

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
    if (matchmakingId && playerId) {
      try { await leaveMatchmaking(matchmakingId, playerId); } catch { }
    }
    abortedByUserRef.current = true;
    hardReset();
  }, [matchmakingId, playerId]);

  const hardReset = () => {
    setMatchmakingId(null); setPlayerId(null); setPlayerNick(null); setGameHubId(null);
    setCurrent(0); setMax(0);
    setStatus("idle"); setReason(undefined);
    setDialogOpen(false); setBusy(false);
    setEndedAt(0);
    setGameData(null); setGameStatus(null);
    setWaitingForGameStart(false);
    setJoinError(null);
    setScreen("none");
    setIsDemo(false);
    setPreDraftEndedAt(null);
    setMyDraftedJumperIds([]);
    // setShouldConnectToGameHub(false); // REMOVED
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

        {/* Demo button */}
        {process.env.NEXT_PUBLIC_SHOW_DEMO_BUTTONS === 'true' && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDemo(true);
                setScreen("predraft");
              }}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Demo: PreDraft Screen
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemo(true);
                setScreen("draft");
              }}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Demo: Draft Screen
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemo(true);
                setScreen("draft"); // DraftBreakDemo now shown in draft screen with isReadOnly
              }}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Demo: Draft Break
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemo(true);
                setScreen("ended");
              }}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Demo: Wyniki końcowe
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsDemo(true);
                setScreen("main-competition");
              }}
              className="text-white border-white/30 hover:bg-white/10"
            >
              Demo: Main Competition
            </Button>
          </div>
        )}

        {/* Error display */}
        {joinError && (
          <div className="mt-4 p-4 rounded-lg border border-red-500/50 bg-red-500/10 backdrop-blur-sm max-w-md">
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
          busy={busy}
        />
        <Toaster richColors />
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
      {screen === "predraft" && (
        isDemo ? (
          <PreDraftDemo onBack={() => {
            setIsDemo(false);
            setScreen("none");
          }} />
        ) : gameData && (gameData.preDraft || gameData.lastCompetitionState) ? (
          (() => {
            const mapped = mapGameDataToPreDraftProps(gameData);
            return (
              <div className="fixed inset-0 z-50">
                <PreDraftScreen
                  gameData={gameData}
                  startlist={mapped.startlist}
                  players={mapped.players}
                  sessions={mapped.sessions}
                  currentJumperDetails={mapped.currentJumperDetails}
                  nextJumpInSeconds={mapped.nextJumpInSeconds}
                  jumpersRemainingInSession={mapped.jumpersRemainingInSession}
                  isBreak={mapped.isBreak}
                  breakRemainingSeconds={mapped.breakRemainingSeconds}
                  nextStatus={mapped.nextStatus}
                  isPreDraftEnded={preDraftEndedAt !== null}
                />
              </div>
            );
          })()
        ) : null
      )}

      {screen === "draft" && (
        isDemo ? (
          <DraftDemo onBack={() => { setIsDemo(false); setScreen("none"); }} />
        ) : gameData && playerId ? (
          <DraftScreen
            gameData={gameData}
            myPlayerId={playerId}
            isReadOnly={!gameData.draft}
          />
        ) : null
      )}

      {screen === "ended" && (
        isDemo ? (
          <div className="fixed inset-0 z-50">
            <GameEndedDemo onBack={() => { setIsDemo(false); setScreen("none"); }} />
          </div>
        ) : (
          <div className="fixed inset-0 z-50">
            {(() => {
              if (!gameData?.ended?.ranking || !gameData?.header) return null;
              const entries = Object.entries(gameData.ended.ranking).map(([pid, v]) => ({
                playerId: pid,
                nick: gameData.header.players.find(p => p.playerId === pid)?.nick ?? pid,
                points: v.points,
                position: v.position,
                isMe: playerId === pid,
              })).sort((a, b) => a.position - b.position);
              return (
                <GameEndedScreen
                  results={entries}
                  onBackToMenu={() => { setScreen("none"); }}
                  policy={gameData.ended?.policy === "PodiumAtAllCosts" ? "PodiumAtAllCosts" : "Classic"}
                  shareUrl={typeof window !== 'undefined' ? window.location.href : undefined}
                  myPlayerId={playerId}
                  hillName={gameData.header.hill?.name}
                  hillHs={Math.round(gameData.header.hill?.hs ?? 0)}
                  hillCountryCode={gameData.header.hill?.alpha2Code}
                />
              );
            })()}
          </div>
        )
      )}

      {screen === "main-competition" && (
        isDemo ? (
          <MainCompetitionDemo onBack={() => { setIsDemo(false); setScreen("none"); }} />
        ) : gameData ? (
          <div className="fixed inset-0 z-50">
            <MainCompetitionScreen
              gameData={gameData}
              myPlayerId={playerId!}
              myDraftedJumperIds={myDraftedJumperIds}
              isEnded={gameData.status === 'Break Ended' || gameData.status === 'Ended'}
            />
          </div>
        ) : null
      )}
    </main>
  );
}

/* listy faz */
const PHASES = [
  // { title: "Wybór skoczni", description: "Gdzie dziś skaczemy? Mamut w Vikersund, skocznia olimpijska, a może malutkie Hinzenbach?" },
  { title: "Obserwacja", description: "Przyjrzyj się formie zawodników... Za chwilę wybierasz!" },
  { title: "Draft", description: "Wybierz swój dream-team na konkurs. Postawisz na sensację treningu, czy na sprawdzonych liderów swoich kadr?" },
  { title: "Konkurs", description: "Czy przeczucie było trafne? Zaraz się okaże!" },
];
