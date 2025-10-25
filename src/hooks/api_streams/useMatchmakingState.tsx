import { useEffect, useRef } from 'react';
import type { MatchmakingPlayerDto } from '@/types/matchmaking';

export type MatchmakingStatus = 'Running' | 'Ended Succeeded' | 'Ended NotEnoughPlayers' | 'Failed' | string;
export interface MatchmakingState {
    status: MatchmakingStatus;
    failReason?: string | null;
    playersCount: number;
    requiredPlayersToMin?: number | null;
    minPlayers: number;
    maxPlayers: number;
    players?: MatchmakingPlayerDto[];
    startedAt?: string | null;
    forceEndAt?: string | null;
    endedAt?: string | null;
    endAfterNoUpdate?: boolean;
    shouldEndAcceleratedAt?: string | null;
}

export interface MatchmakingStateHandlers {
    onPlayerJoined?: (p: MatchmakingPlayerDto) => void;
    onPlayerLeft?: (p: MatchmakingPlayerDto) => void;
}

export function useMatchmakingState(
    matchId: string | null,
    onState: (s: MatchmakingState) => void,
    handlers?: MatchmakingStateHandlers,
    playerId?: string | null,
    authToken?: string | null,
) {
    const prevPlayersRef = useRef<string[]>([]);
    useEffect(() => {
        if (!matchId || !playerId || !authToken) {
            prevPlayersRef.current = [];
            return;
        }

        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5150').replace(/\/$/, '');
        const url = `${base}/matchmaking/${matchId}/stream?playerId=${encodeURIComponent(playerId)}&auth=${encodeURIComponent(authToken)}`;
        const es = new EventSource(url, { withCredentials: true });

        const handle = (e: MessageEvent) => {
            const d = JSON.parse(e.data ?? '{}');
            console.log("matchmaking payload:", d);

            const playersArr: MatchmakingPlayerDto[] | undefined = d.Players?.map((p: any) => ({
                playerId: String(p.PlayerId ?? p.playerId ?? ''),
                nick: String(p.Nick ?? p.nick ?? ''),
                isBot: Boolean(p.IsBot ?? p.isBot ?? p.IsBot === 'true' ?? p.isBot === 'true' ?? false),
                joinedAt: String(p.JoinedAt ?? p.joinedAt ?? new Date().toISOString())
            }));

            // Diff to emit joined/left notifications
            if (playersArr && Array.isArray(playersArr)) {
                const currentIds = playersArr.map(p => p.playerId);
                const prevIds = prevPlayersRef.current;
                const joinedIds = currentIds.filter(id => !prevIds.includes(id));
                const leftIds = prevIds.filter(id => !currentIds.includes(id));
                if (joinedIds.length && handlers?.onPlayerJoined) {
                    joinedIds.forEach(id => {
                        const p = playersArr.find(x => x.playerId === id);
                        if (p) handlers.onPlayerJoined!(p);
                    });
                }
                if (leftIds.length && handlers?.onPlayerLeft) {
                    leftIds.forEach(id => {
                        const p: MatchmakingPlayerDto = {
                            playerId: id,
                            nick: id,
                            isBot: false,
                            joinedAt: new Date().toISOString()
                        };
                        handlers.onPlayerLeft!(p);
                    });
                }
                prevPlayersRef.current = currentIds;
            }

            onState({
                status: d.Status ?? d.status,
                failReason: d.FailReason ?? d.failReason ?? null,
                playersCount: d.PlayersCount ?? d.playersCount ?? 0,
                requiredPlayersToMin: d.RequiredPlayersToMin ?? d.MinRequiredPlayers ?? null,
                minPlayers: d.MinPlayers ?? d.minPlayers ?? 0,
                maxPlayers: d.MaxPlayers ?? d.maxPlayers ?? 0,
                players: playersArr,
                startedAt: d.StartedAt ?? d.startedAt ?? null,
                forceEndAt: d.ForceEndAt ?? d.forceEndAt ?? null,
                endedAt: d.EndedAt ?? d.endedAt ?? null,
                endAfterNoUpdate: d.EndAfterNoUpdate ?? d.endAfterNoUpdate ?? false,
                shouldEndAcceleratedAt: d.ShouldEndAcceleratedAt ?? d.shouldEndAcceleratedAt ?? null,
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
            prevPlayersRef.current = [];
        };
    }, [matchId, onState, handlers?.onPlayerJoined, handlers?.onPlayerLeft]);
}
