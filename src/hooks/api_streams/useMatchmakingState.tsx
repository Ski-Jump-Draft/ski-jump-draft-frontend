import { useEffect } from 'react';

export type MatchmakingStatus = 'Running' | 'Ended Succeeded' | 'Ended NotEnoughPlayers' | 'Failed';
export interface MatchmakingState {
    status: MatchmakingStatus;
    failReason?: string | null;
    playersCount: number;
    minRequiredPlayers?: number | null;
    minPlayers: number;
    maxPlayers: number;
    remainingTime?: string | number | null;
}

export function useMatchmakingState(
    matchId: string | null,
    onState: (s: MatchmakingState) => void,
) {
    useEffect(() => {
        if (!matchId) return;
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5150').replace(/\/$/, '');
        const es = new EventSource(`${base}/matchmaking/${matchId}/stream`);

        const handle = (e: MessageEvent) => {
            const d = JSON.parse(e.data ?? '{}');
            console.log("matchmaking payload:", d);

            onState({
                status: d.Status,
                failReason: d.FailReason ?? null,
                playersCount: d.PlayersCount ?? 0,
                minRequiredPlayers: d.MinRequiredPlayers ?? null,
                minPlayers: d.MinPlayers ?? 0,
                maxPlayers: d.MaxPlayers ?? 0,
                remainingTime: d.RemainingTime ?? null,
            });
        };

        const onError = (e: any) => {
            console.error('MatchmakingEventSource error:', e);
            try { es.close(); } catch { }
        };

        // działa, jeśli wysyłasz nazwany event:
        es.addEventListener('matchmaking-updated', handle);
        // …i/lub domyślny:
        es.onmessage = handle;
        es.onerror = onError;

        return () => {
            es.removeEventListener('matchmaking-updated', handle);
            es.onerror = null as any;
            es.close();
        };
    }, [matchId, onState]);
}
