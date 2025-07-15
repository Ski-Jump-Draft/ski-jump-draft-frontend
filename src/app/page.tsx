"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateNickname } from "../../utils/nickname";
import {
  joinMatchmaking,
  quitMatchmaking,
  JoinResponse,
} from "@/lib/matchmaking";
import { MatchmakingDialog } from "@/components/MatchmakingDialog";
import { useMatchmakingStream } from "@/hooks/useMatchmakingStream";

/**
 * Front page odpowiada za:
 * 1. Zgłoszenie się do matchmakingu (`/game/join`).
 * 2. Nasłuch Server‑Sent Events na `/game/matchmaking`.
 * 3. Zarządzanie dialogiem postępu.
 */
export default function HomePage() {
  const router = useRouter();

  // ► Nickname & placeholder
  const [nick, setNick] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    setPlaceholder(generateNickname());
  }, []);

  // ► Matchmaking state
  const [matchId, setMatchId] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [max, setMax] = useState(0);
  const [status, setStatus] = useState<"idle" | "waiting" | "starting" | "failed">(
    "idle",
  );
  const [failedReason, setFailedReason] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  /* -------------------------------------------------
   * Server‑Sent Events
   * ------------------------------------------------- */
  useMatchmakingStream(matchId, (ev) => {
    switch (ev.type) {
      case "updated": {
        setCurrent(ev.current);
        setMax(ev.max);
        setStatus("waiting");
        break;
      }
      case "ended": {
        // Zawody gotowe do startu – wejście w "Rozpoczynanie".
        setStatus("starting");
        setCurrent(ev.players);
        // Zamykamy dialog po 2 s, potem przenosimy do draftu.
        setTimeout(() => {
          setMatchId(null); // zamyka dialog
          router.push(`/draft?match=${matchId}`);
        }, 2000);
        break;
      }
      case "failed": {
        setStatus("failed");
        setFailedReason(ev.reason);
        setCurrent(ev.current);
        setMax(ev.max);
        break;
      }
    }
  });

  /* -------------------------------------------------
   * Akcje użytkownika
   * ------------------------------------------------- */
  // ► „Zagraj”
  const submit = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    try {
      const chosenNick = (nick.trim() || placeholder).slice(0, 24);
      const info: JoinResponse = await joinMatchmaking(chosenNick);

      setMatchId(info.gameId);
      setParticipantId(info.participantId);
      setCurrent(info.currentPlayers);
      setMax(info.maxPlayers);
      setStatus("waiting");
    } catch (err) {
      console.error(err);
      alert("Nie udało się dołączyć do matchmakingu.");
    } finally {
      setBusy(false);
    }
  }, [nick, placeholder, busy]);

  // ► „Przerwij” / zamknij dialog
  const abort = useCallback(async () => {
    if (matchId && participantId) {
      try {
        await quitMatchmaking(matchId, participantId);
      } catch (err) {
        console.error(err);
      }
    }
    reset();
  }, [matchId, participantId]);

  const reset = () => {
    setMatchId(null);
    setParticipantId(null);
    setCurrent(0);
    setMax(0);
    setStatus("idle");
    setFailedReason(undefined);
    setBusy(false);
  };

  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden font-sans">
      {/* Tło */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-80 dark:opacity-40"
        style={{ backgroundImage: "url('/assets/predazzo_4k.jpeg')" }}
      />

      {/* Glassmorphic card */}
      <div className="flex flex-col items-center space-y-8 rounded-3xl border border-white/20 bg-white/10 p-10 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-black/0">
        <h1 className="font-heading text-5xl font-bold tracking-tight text-white drop-shadow-md">
          SJ Draft
        </h1>

        <p className="max-w-md text-center text-white/80 drop-shadow-sm">
          Prezentujemy darmową grę, w której kompletujesz swój zespół skoczków
          narciarskich. Obserwuj skoki zawodników i popisz się intuicją – kto jest
          dziś w dobrej formie?
        </p>

        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Input
            placeholder={placeholder}
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            className="w-64 text-center"
            disabled={busy || status !== "idle"}
          />
          <Button
            size="lg"
            onClick={submit}
            className="font-heading"
            disabled={busy || status !== "idle"}
          >
            {busy ? "Łączenie…" : "Zagraj"}
          </Button>
        </div>

        <MatchmakingDialog
          open={!!matchId}
          current={current}
          max={max}
          status={status === "starting" ? "starting" : status === "failed" ? "failed" : "waiting"}
          reason={failedReason}
          onCancel={abort}
        />
      </div>
    </main>
  );
}
