import { useEffect } from 'react';

interface UpdatedEvent {
    type: 'updated';
    current: number;
    max: number;
}
interface EndedEvent {
    type: 'ended';
    players: number;
}
interface FailedEvent {
    type: 'failed';
    current: number;
    max: number;
    reason?: string;
}
export type MatchmakingEvent = UpdatedEvent | EndedEvent | FailedEvent;

/**
 * Hook nasłuchujący SSE z `/game/matchmaking` i przekazujący parsowane zdarzenia.
 */
export function useMatchmakingStream(
    gameId: string | null,
    onEvent: (ev: MatchmakingEvent) => void,
) {
    useEffect(() => {
        if (!gameId) return;

        let cancelled = false;
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5043';
        const es = new EventSource(`${base}/game/matchmaking?gameId=${gameId}`);

        const parse = (e: MessageEvent<any>) => JSON.parse(e.data ?? '{}');

        const handleUpdated = (e: MessageEvent) => {
            if (cancelled) return;
            const d = parse(e);
            onEvent({
                type: 'updated',
                current: d.CurrentPlayersCount ?? d.currentPlayers ?? d.PlayersCount ?? 0,
                max: d.MaxPlayersCount ?? d.maxPlayers ?? d.MaxPlayersCount ?? 0,
            });
        };

        const handleEnded = (e: MessageEvent) => {
            if (cancelled) return;
            const d = parse(e);
            onEvent({ type: 'ended', players: d.PlayersCount ?? d.players ?? 0 });
        };

        const handleFailed = (e: MessageEvent) => {
            if (cancelled) return;
            const d = parse(e);
            onEvent({
                type: 'failed',
                current: d.PlayersCount ?? d.current ?? 0,
                max: d.MaxPlayersCount ?? d.max ?? 0,
                reason: d.reason,
            });
        };

        es.addEventListener('updated', handleUpdated);
        es.addEventListener('ended', handleEnded);
        es.addEventListener('failed', handleFailed);

        return () => {
            cancelled = true;
            es.removeEventListener('updated', handleUpdated);
            es.removeEventListener('ended', handleEnded);
            es.removeEventListener('failed', handleFailed);
            es.close();
        };
    }, [gameId]);
}