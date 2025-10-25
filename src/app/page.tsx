"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateNickname } from "@/utils/nickname";
import { joinMatchmaking, joinPremiumMatchmaking, leaveMatchmaking, JoinResponse, getMatchmaking, JoinError } from "@/lib/matchmaking";
import { MatchmakingDialog } from "@/components/MatchmakingDialog";
import { PrivateRoomDialog } from "@/components/PrivateRoomDialog";
import { useMatchmakingState } from "@/hooks/api_streams/useMatchmakingState";
import { TransitionScreen } from "@/components/TransitionScreen";
import { PreDraftDemo } from "@/components/PreDraftDemo";
import { PreDraftScreen } from "@/components/PreDraftScreen";
import { DraftScreen } from "@/components/draft/DraftScreen";
import { DraftDemo } from "@/components/draft/DraftDemo";
import { mapGameDataToPreDraftProps } from "@/lib/gameMapper";
import {
  useGameHubStream,
  GameHubEvent,
} from "@/hooks/api_streams/useGameHubStream";

import { GameUpdatedDto, GameStatus } from "@/types/game";
import { Toaster, toast } from 'sonner';
import { GameEndedDemo } from "@/components/GameEndedDemo";
import { GameEndedScreen } from "@/components/GameEndedScreen";
import { MainCompetitionScreen } from "@/components/main-competition/MainCompetitionScreen";
import { MainCompetitionDemo } from "@/components/main-competition/MainCompetitionDemo";
import { CreditsDialog } from "@/components/credits/CreditsDialog";
import { WeeklyTopJumps } from "@/components/WeeklyTopJumps";
import { TutorialDialog } from "@/components/TutorialDialog";

/* ───────────────────────────────────────────── */

export default function HomePage() {
  const abortedByUserRef = useRef(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [nick, setNick] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  useEffect(() => setPlaceholder(generateNickname()), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const [players, setPlayers] = useState<Array<{ playerId: string; nick: string; isBot: boolean; joinedAt: string }>>([]);
  const [minPlayers, setMinPlayers] = useState<number>(0);
  const [forceEndAt, setForceEndAt] = useState<string | null>(null);
  const [shouldEndAcceleratedAt, setShouldEndAcceleratedAt] = useState<string | null>(null);
  const [endAfterNoUpdate, setEndAfterNoUpdate] = useState<boolean>(false);
  const [recentJoins, setRecentJoins] = useState<Array<{ playerId: string; nick: string; isBot: boolean; joinedAt: string }>>([]);
  const [recentLeaves, setRecentLeaves] = useState<Array<{ playerId: string; nick: string; isBot: boolean; joinedAt: string }>>([]);

  /* private room */
  const [privateRoomDialogOpen, setPrivateRoomDialogOpen] = useState(false);
  const [privateRoomError, setPrivateRoomError] = useState<string | null>(null);
  const [privateRoomBusy, setPrivateRoomBusy] = useState(false);

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
  const [allDraftPicks, setAllDraftPicks] = useState<Array<{ playerId: string; jumperIds: string[] }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [snowflakes] = useState<Array<{
    size: number;
    left: number;
    animationDuration: number;
    animationDelay: number;
    opacity: number;
  }>>(() => Array.from({ length: 60 }, () => ({
    size: 12 + Math.random() * 8,
    left: Math.random() * 100,
    animationDuration: 12 + Math.random() * 18,
    animationDelay: Math.random() * 20,
    opacity: 0.7 + Math.random() * 0.3,
  })));

  const [helpOpen, setHelpOpen] = useState(false);

  // Persist my draft picks when draft data is available
  useEffect(() => {
    if (gameData?.draft?.picks && playerId) {
      const myPicks = gameData.draft.picks.find(p => p.playerId === playerId)?.jumperIds;
      if (myPicks) {
        setMyDraftedJumperIds(myPicks);
      }

      // Save all picks for later use in MainCompetition
      if (gameData.draft.picks.length > 0) {
        setAllDraftPicks(gameData.draft.picks);
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

      // Parse TimeSpan properly (format: "00:00:18" or "00:01:30")
      const parseTimeSpan = (timeSpan: string): number => {
        if (!timeSpan) return 0;
        const parts = timeSpan.split(':');
        if (parts.length === 3) {
          const hours = parseInt(parts[0], 10);
          const minutes = parseInt(parts[1], 10);
          const secs = parseInt(parts[2], 10);
          return hours * 3600 + minutes * 60 + secs;
        }
        return 0;
      };

      const totalSeconds = parseTimeSpan(timeSpan);

      console.log("Timer useEffect - TimeSpan:", timeSpan, "TotalSeconds:", totalSeconds, "NextStatus:", gameData.nextStatus.status);

      if (totalSeconds === 0) {
        console.log("Timer reached 0, switching to:", gameData.nextStatus.status);
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
    } else {
      console.log("Timer useEffect - No nextStatus available");
    }
  }, [gameData?.nextStatus]);

  useMatchmakingState(matchmakingId, s => {
    setCurrent(s.playersCount);
    setMax(s.maxPlayers);
    setMinPlayers(s.minPlayers);
    setPlayers(s.players ?? []);
    setForceEndAt(s.forceEndAt ?? null);
    setShouldEndAcceleratedAt(s.shouldEndAcceleratedAt ?? null);
    setEndAfterNoUpdate(s.endAfterNoUpdate ?? false);

    if (s.status === "Running") {
      setStatus("waiting");
    } else if (s.status === "Ended Succeeded") {
      setStatus("starting");
      setEndedAt(Date.now());
      setWaitingForGameStart(true);
      const t = setTimeout(() => {
        setDialogOpen(false);
        setScreen("transition1");
        console.log("Matchmaking ended, switching to transition1 screen");
      }, 1200);
      return () => clearTimeout(t);
    } else if (s.status === "Ended NotEnoughPlayers" || s.status === "Failed") {
      setStatus("failed");
      setReason(s.failReason ?? (s.status === "Ended NotEnoughPlayers" ? "Not enough players" : "Matchmaking failed"));
    }
  }, {
    onPlayerJoined: (p) => {
      setRecentJoins(prev => [...prev, p]);
      // Auto-clear after 3 seconds
      setTimeout(() => {
        setRecentJoins(prev => prev.filter(player => player.playerId !== p.playerId));
      }, 3000);
    },
    onPlayerLeft: (p) => {
      setRecentLeaves(prev => [...prev, p]);
      // Auto-clear after 3 seconds
      setTimeout(() => {
        setRecentLeaves(prev => prev.filter(player => player.playerId !== p.playerId));
      }, 3000);
    }
  }, playerId, authToken);

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
          console.log("GameUpdated received - Status:", ev.data.status, "NextStatus:", ev.data.nextStatus?.status, "Current screen:", screen);

          // Clear matchmakingId after receiving first GameUpdated, but only if we have gameHubId
          // This is the signal that game has started and we received first game data
          if (matchmakingId) {
            // Stay on the same SignalR connection; do not switch to a new game connection here
            setWaitingForGameStart(false);
            console.log("First game data received after matchmaking, clearing waitingForGameStart");

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
          // If we have nextStatus and we're not in the target phase yet, stay on transition screen
          // Only switch to actual game screen when we reach the target phase or when nextStatus is null
          if (ev.data.nextStatus && ev.data.nextStatus.status !== ev.data.status && ev.data.status !== 'Break Ended' && ev.data.status !== 'Break PreDraft' && ev.data.nextStatus.status !== 'PreDraftNextCompetition') {
            // Stay on transition screen and let timer handle the switch
            // Don't change screen here - keep showing transition until timer expires
            console.log("Keeping transition screen, waiting for timer. Current status:", ev.data.status, "Next status:", ev.data.nextStatus.status);
          } else {
            // No nextStatus, but if we just finished matchmaking, stay on transition screen
            // until we get proper nextStatus or until the game actually starts
            // But don't block if we're already in the target phase (timer already switched us)
            if (waitingForGameStart || (matchmakingId && screen === "transition1" && ev.data.status !== "PreDraft")) {
              console.log("Just finished matchmaking, staying on transition screen until game phase starts");
              return; // Don't switch screens yet
            }

            // No nextStatus, switch immediately based on game status
            switch (ev.data.status) {
              case "PreDraft":
                console.log("PreDraft status received, checking for competition data");
                // Only show predraft if we have active competition data
                if (ev.data.preDraft?.competition) {
                  console.log("PreDraft competition data found, switching to predraft screen");
                  setScreen("predraft");
                } else {
                  console.log("No PreDraft competition data, staying on current screen");
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
    playerId,
    authToken,
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
      setAuthToken(info.authToken);
      // setShouldConnectToGameHub(true); // REMOVED - connection will start because matchmakingId is set

      const snapshot = await getMatchmaking(info.matchmakingId);
      setCurrent(snapshot.playersCount);
      setMax(snapshot.maxPlayers);
      setMinPlayers(snapshot.minPlayers);
      setPlayers(snapshot.players || []);
      setForceEndAt(snapshot.forceEndAt || null);
      setShouldEndAcceleratedAt(snapshot.shouldEndAcceleratedAt || null);

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
      console.log('MatchmakingDialog: Opening dialog with status:', uiStatus, 'dialogOpen:', true);

    } catch (error) {
      let errorMessage = "Nie udało się dołączyć do matchmakingu. Spróbuj ponownie.";

      if (error && typeof error === 'object' && 'error' in error) {
        // This is a JoinError from our API
        const joinError = error as JoinError;
        setJoinError(joinError);
        errorMessage = joinError.message;
      } else {
        // Generic error
        const genericError: JoinError = {
          error: 'ServerError',
          message: errorMessage
        };
        setJoinError(genericError);
      }

      // Show dialog even on error so user can see the error message
      setStatus("failed");
      setReason(errorMessage);
      setDialogOpen(true);
      console.log('MatchmakingDialog: Opening error dialog with message:', errorMessage, 'dialogOpen:', true);
    } finally {
      setBusy(false);
    }
  }, [busy, nick, placeholder]);

  /* ── 4b. PRYWATNY POKÓJ ── */
  const submitPrivateRoom = useCallback(async (roomNick: string, password: string) => {
    if (privateRoomBusy) return;

    // Validate password before sending
    if (!password || password.trim() === '') {
      setPrivateRoomError('Musisz wpisać hasło dostępu do prywatnego pokoju.');
      return;
    }

    setPrivateRoomBusy(true);
    setPrivateRoomError(null);
    setJoinError(null);

    try {
      const nickSend = roomNick.slice(0, 24);
      const info: JoinResponse = await joinPremiumMatchmaking(nickSend, password);
      setMatchmakingId(info.matchmakingId);
      setPlayerId(info.playerId);
      setPlayerNick(info.correctedNick);

      const snapshot = await getMatchmaking(info.matchmakingId);
      setCurrent(snapshot.playersCount);
      setMax(snapshot.maxPlayers);
      setMinPlayers(snapshot.minPlayers);
      setPlayers(snapshot.players || []);
      setForceEndAt(snapshot.forceEndAt || null);
      setShouldEndAcceleratedAt(snapshot.shouldEndAcceleratedAt || null);

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
      setPrivateRoomDialogOpen(false); // Close private room dialog
      setDialogOpen(true); // Open matchmaking dialog
      console.log('PrivateRoom: Successfully joined, opening matchmaking dialog with status:', uiStatus);

    } catch (error) {
      let errorMessage = "Nie udało się dołączyć do prywatnego pokoju. Spróbuj ponownie.";

      if (error && typeof error === 'object' && 'error' in error) {
        // This is a JoinError from our API
        const joinError = error as JoinError;

        // Use specific error messages based on error type
        if (joinError.error === 'InvalidPasswordException') {
          errorMessage = 'Nieprawidłowe hasło dostępu do pokoju.';
        } else if (joinError.error === 'AlreadyJoined') {
          errorMessage = 'Już dołączyłeś do tego pokoju.';
        } else if (joinError.error === 'RoomIsFull') {
          errorMessage = 'Pokój jest pełny. Spróbuj dołączyć później.';
        } else if (joinError.error === 'PrivateServerInUse') {
          errorMessage = 'Gra na tym serwerze jest już rozgrywana.';
        } else {
          errorMessage = joinError.message;
        }
      }

      setPrivateRoomError(errorMessage);
      console.log('PrivateRoom: Error joining:', errorMessage);
    } finally {
      setPrivateRoomBusy(false);
    }
  }, [privateRoomBusy]);

  /* ── 5. PRZERWIJ ── */
  const abort = useCallback(async () => {
    if (matchmakingId && playerId) {
      try { await leaveMatchmaking(matchmakingId, playerId, authToken ?? undefined); } catch { }
    }
    abortedByUserRef.current = true;
    hardReset();
  }, [matchmakingId, playerId]);

  const hardReset = () => {
    setMatchmakingId(null); setPlayerId(null); setPlayerNick(null); setGameHubId(null);
    setCurrent(0); setMax(0);
    setDialogOpen(false); setBusy(false);
    setEndedAt(0);
    setGameData(null); setGameStatus(null);
    setWaitingForGameStart(false);
    setJoinError(null);
    setScreen("none");
    setIsDemo(false);
    setPreDraftEndedAt(null);
    setMyDraftedJumperIds([]);
    setAllDraftPicks([]);
    setRecentJoins([]);
    setRecentLeaves([]);
    setEndAfterNoUpdate(false);

    // Reset status and reason after a delay to prevent flash
    setTimeout(() => {
      setStatus("idle");
      setReason(undefined);
    }, 200);
    // setShouldConnectToGameHub(false); // REMOVED
  };

  /* ── UI ── */
  return (
    <main className="relative flex min-h-screen w-screen items-center justify-center overflow-auto font-sans">
      {/* Animated background with gradient overlay */}

      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/wiselka.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/75 via-slate-800/90 to-slate-900/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Falling snow effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {isClient && snowflakes.map((snowflake, i) => (
          <div
            key={i}
            className="absolute text-white"
            style={{
              left: `${snowflake.left}%`,
              top: `-30px`,
              animation: `fall ${snowflake.animationDuration}s linear infinite`,
              animationDelay: `${snowflake.animationDelay}s`,
              opacity: snowflake.opacity,
            }}
          >
            <svg
              width={snowflake.size}
              height={snowflake.size}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="drop-shadow-lg"
            >
              <path d="M12 2L13.09 8.26L19 7L14.74 13.09L22 12L15.74 14.91L21 17L14.91 18.74L20 22L12 19L11 22L9.09 15.74L3 17L7.26 10.91L0 12L6.26 9.09L1 7L7.09 5.26L2 2L10 5L11 2L12 2Z" />
            </svg>
          </div>
        ))}
      </div>


      {/* Main content container - only show when screen is "none" */}
      {screen === "none" && (
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6">
          {/* Hero section */}
          <div className="text-center mb-12">
            {/* Logo */}
            {/* <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/25 p-2">
            <img
              src="/sjdraft.webp"
              alt="SJ Draft Logo"
              className="w-full h-full object-contain"
            />
          </div> */}

            {/* Title with gradient */}
            <h1 className="text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Ski Jump Draft
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
              Obserwuj skoki zawodników i skompletuj najlepszy skład ze wszystkich!
            </p>

            {/* Duration badge */}
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-slate-300">Rozgrywka trwa około 20 minut</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-10 items-start justify-center">
            {/* LEFT: ranking */}
            <aside className="w-full md:w-[25rem] lg:w-[25rem] shrink-0 order-2 md:order-1">
              <WeeklyTopJumps />
            </aside>

            {/* Right column: main card */}
            <div className="flex-1 order-1 md:order-2 relative">
              {/* Help button – obok prawego górnego rogu carda */}
              <button
                onClick={() => setHelpOpen(true)}
                className="absolute -top-0 -right-10 w-9 h-9 flex items-center justify-center 
               rounded-full bg-gradient-to-br from-blue-600 to-purple-600 
               text-white text-base font-bold shadow-lg shadow-blue-500/30 
               hover:scale-110 transition-all duration-300"
              >
                ?
              </button>

              <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Game entry form */}
                  {/* Input section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Wybierz swój pseudonim
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Input
                          placeholder={placeholder}
                          value={nick}
                          onChange={e => setNick(e.target.value)}
                          disabled={busy || status !== "idle"}
                          className="h-12 px-4 text-lg bg-slate-800/50 border-slate-600/50 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl transition-all duration-200 placeholder-gray"
                        />
                      </div>
                      <Button
                        disabled={busy || status !== "idle"}
                        onClick={submit}
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105"
                      >
                        {busy ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Łączenie…
                          </div>
                        ) : (
                          "Zagraj"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Demo buttons */}
                  {process.env.NEXT_PUBLIC_SHOW_DEMO_BUTTONS === 'true' && (
                    <div className="pt-6 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-sm font-medium text-slate-400">Tryb deweloperski</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { label: "PreDraft", screen: "predraft" },
                          { label: "Draft", screen: "draft" },
                          { label: "Draft Break", screen: "draft" },
                          { label: "Wyniki", screen: "ended" },
                          { label: "Konkurs", screen: "main-competition" }
                        ].map((demo) => (
                          <Button
                            key={demo.screen + demo.label}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsDemo(true);
                              setScreen(demo.screen as any);
                            }}
                            className="text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 rounded-lg transition-all duration-200"
                          >
                            {demo.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Private room button - subtle and at the bottom */}
                  <div className="pt-6 border-t border-slate-700/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrivateRoomDialogOpen(true)}
                      disabled={busy || status !== "idle"}
                      className="w-full text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 transition-all duration-200 text-xs"
                    >
                      <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Prywatny pokój
                    </Button>
                  </div>

                  {/* Legal + credits links */}
                  <div className="pt-4 flex justify-center gap-6 text-xs text-slate-500">
                    <a
                      href="/legal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-300 flex items-center gap-1 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Polityka prywatności
                    </a>
                    <a
                      href="/legal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-300 flex items-center gap-1 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Regulamin
                    </a>
                    <CreditsDialog />

                  </div>

                </div>
              </div>
            </div>
          </div>

          <Toaster richColors />
        </div>
      )}

      {/* Matchmaking Dialog - always visible when open */}
      <MatchmakingDialog
        open={dialogOpen}
        current={current}
        max={max}
        min={minPlayers}
        status={status === "starting" ? "starting" : status === "failed" ? "failed" : "waiting"}
        reason={reason}
        onCancel={abort}
        busy={busy}
        forceEndAt={forceEndAt}
        shouldEndAcceleratedAt={shouldEndAcceleratedAt}
        endAfterNoUpdate={endAfterNoUpdate}
        players={status === "failed" ? [] : players}
        recentJoins={status === "failed" ? [] : recentJoins}
        recentLeaves={status === "failed" ? [] : recentLeaves}
      />

      {/* Private Room Dialog */}
      <PrivateRoomDialog
        open={privateRoomDialogOpen}
        onClose={() => {
          setPrivateRoomDialogOpen(false);
          setPrivateRoomError(null);
        }}
        onSubmit={submitPrivateRoom}
        busy={privateRoomBusy}
        error={privateRoomError}
        placeholder={placeholder}
      />

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
            hardReset();
          }} />
        ) : gameData && (gameData.preDraft || gameData.lastCompetitionState) ? (
          (() => {
            const mapped = mapGameDataToPreDraftProps(gameData);
            return (
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
            );
          })()
        ) : null
      )}

      {screen === "draft" && (
        isDemo ? (
          <DraftDemo onBack={() => { setIsDemo(false); hardReset(); }} />
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
          <GameEndedDemo onBack={() => { setIsDemo(false); hardReset(); }} />
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
                  onBackToMenu={() => { hardReset(); }}
                  policy={gameData.header.rankingPolicy === "PodiumAtAllCosts" ? "PodiumAtAllCosts" : "Classic"}
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
          <MainCompetitionDemo onBack={() => { setIsDemo(false); hardReset(); }} />
        ) : gameData ? (
          <div className="fixed inset-0 z-50">
            <MainCompetitionScreen
              gameData={gameData}
              myPlayerId={playerId!}
              myDraftedJumperIds={myDraftedJumperIds}
              allDraftPicks={allDraftPicks}
              isEnded={gameData.status === 'Break Ended' || gameData.status === 'Ended'}
            />
          </div>
        ) : null
      )}

      <TutorialDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
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
