import { useEffect } from 'react';

export type MatchmakingStatus = 'Running' | 'Ended' | 'Failed';
export interface MatchmakingState {
    status: MatchmakingStatus;
    failReason?: string | null;
    playersCount: number;
    minRequiredPlayers?: number | null;
    minPlayers?: number | null;
    maxPlayers?: number | null;
    remainingTime?: string | number | null; // TimeSpan przyjdzie jako string
}

export function useMatchmakingState(
    matchId: string | null,
    onState: (s: MatchmakingState) => void,
) {
    useEffect(() => {
        if (!matchId) return;
        const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
        const es = new EventSource(`${base}/matchmaking/${matchId}/stream`);


        const handle = (e: MessageEvent) => {
            const d = JSON.parse(e.data ?? '{}');
            console.log("payload:", d);

            onState({
                status: d.Status,
                failReason: d.FailReason ?? null,
                playersCount: d.PlayersCount ?? 0,
                minRequiredPlayers: d.MinRequiredPlayers ?? null,
                minPlayers: d.MinPlayers ?? null,
                maxPlayers: d.MaxPlayers ?? null,
                remainingTime: d.RemainingTime ?? null,
            });
        };

        // działa, jeśli wysyłasz nazwany event:
        es.addEventListener('matchmaking-updated', handle);
        // …i/lub domyślny:
        es.onmessage = handle;

        return () => { es.removeEventListener('matchmaking-updated', handle); es.close(); };
    }, [matchId, onState]);
}
