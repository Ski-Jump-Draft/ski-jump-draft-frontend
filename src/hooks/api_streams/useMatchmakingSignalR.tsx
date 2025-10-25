import { useEffect, useRef } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { GameUpdatedDto } from '@/types/game';

export interface GameStartedAfterMatchmakingEvent {
    type: 'gameStartedAfterMatchmaking';
    matchmakingId: string;
    gameId: string;
    playersMapping: Record<string, string>;
}

export interface GameUpdatedEvent {
    type: 'gameUpdated';
    data: GameUpdatedDto;
}

export type MatchmakingSignalREvent =
    | GameStartedAfterMatchmakingEvent
    | GameUpdatedEvent;

export function useMatchmakingSignalR(
    matchmakingId: string | null,
    onEvent: (ev: MatchmakingSignalREvent) => void,
    playerId?: string | null,
    authToken?: string | null,
): void {
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!matchmakingId || !playerId || !authToken) {
            console.log('useMatchmakingSignalR: missing creds, skipping');
            return;
        }

        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5150';
        const connection = new HubConnectionBuilder()
            .withUrl(`${base}/game/hub`, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('SignalR connected for matchmaking:', matchmakingId);

                // Auth join
                await connection.invoke('JoinMatchmaking', matchmakingId, playerId, authToken);
                console.log('Joined matchmaking group (authed):', matchmakingId);

                connection.on('GameStartedAfterMatchmaking', (data: any) => {
                    onEventRef.current({
                        type: 'gameStartedAfterMatchmaking',
                        matchmakingId: data.matchmakingId,
                        gameId: data.gameId,
                        playersMapping: data.playersMapping,
                    });
                });

                connection.on('GameUpdated', (data: any) => {
                    onEventRef.current({ type: 'gameUpdated', data });
                });
            } catch (err) {
                console.error('SignalR matchmaking connection error:', err);
            }
        };

        startConnection();
        return () => { connection.stop(); };
    }, [matchmakingId, playerId, authToken]);
}
