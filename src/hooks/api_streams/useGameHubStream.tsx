import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { GameUpdatedDto } from '@/types/game';

export interface GameUpdatedEvent {
    type: 'gameUpdated';
    data: GameUpdatedDto;
}

export interface GameEndedEvent {
    type: 'gameEnded';
    gameId: string;
}

export interface GameStartedAfterMatchmakingEvent {
    type: 'gameStartedAfterMatchmaking';
    matchmakingId: string;
    gameId: string;
    playersMapping: Record<string, string>;
}

export type GameHubEvent =
    | GameUpdatedEvent
    | GameEndedEvent
    | GameStartedAfterMatchmakingEvent;

export function useGameHubStream(
    gameId: string | null,
    onEvent: (ev: GameHubEvent) => void,
    matchmakingId?: string | null,
    onDisconnected?: () => void,
): void {
    // trzyma stale aktualną referencję do onEvent (nie wywoła useEffect przy każdej zmianie funkcji!)
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        if (!gameId && !matchmakingId) {
            console.log("useGameHubStream: No IDs provided, skipping connection.");
            // Stop any existing connection if IDs are cleared
            if (connectionRef.current) {
                console.log("useGameHubStream: Stopping active connection due to missing IDs.");
                connectionRef.current.stop();
                connectionRef.current = null;
            }
            return;
        }

        const targetId = gameId || matchmakingId;
        const isMatchmaking = !gameId && !!matchmakingId;
        console.log('useGameHubStream: Starting connection', { gameId, matchmakingId, isMatchmaking, targetId });

        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5150';
        const connection = new HubConnectionBuilder()
            .withUrl(`${base}/game/hub`)
            .build();

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR connection started.");

                if (isMatchmaking) {
                    await connection.invoke('JoinMatchmaking', matchmakingId);
                } else {
                    await connection.invoke('JoinGame', gameId);
                }

                connection.on('GameUpdated', (data: GameUpdatedDto) => {
                    onEventRef.current({
                        type: 'gameUpdated',
                        data
                    });
                });

                connection.on('GameEnded', (gameId: string) => {
                    onEventRef.current({
                        type: 'gameEnded',
                        gameId
                    });
                });

                if (isMatchmaking) {
                    connection.on('GameStartedAfterMatchmaking', async (data: any) => {
                        try {
                            await connection.invoke('JoinGame', data.gameId);
                        } catch (err) {
                            console.error('Failed to switch to game group:', err);
                        }

                        onEventRef.current({
                            type: 'gameStartedAfterMatchmaking',
                            matchmakingId: data.matchmakingId,
                            gameId: data.gameId,
                            playersMapping: data.playersMapping
                        });
                    });
                }

                connection.onclose((error) => {
                    console.error('SignalR connection closed:', error);
                    if (onDisconnected) {
                        onDisconnected();
                    }
                });

            } catch (err) {
                console.error('SignalR connection error:', err);
                if (onDisconnected) {
                    onDisconnected();
                }
            }
        };

        startConnection();
        connectionRef.current = connection;

        return () => {
            connection.stop();
            connectionRef.current = null;
        };
    }, [gameId, matchmakingId]);
}
