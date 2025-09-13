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
): void {
    // trzyma stale aktualną referencję do onEvent (nie wywoła useEffect przy każdej zmianie funkcji!)
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!gameId && !matchmakingId) {
            return;
        }

        const targetId = gameId || matchmakingId;
        const isMatchmaking = !gameId && matchmakingId;

        // Starting SignalR connection

        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5150';
        const connection = new HubConnectionBuilder()
            .withUrl(`${base}/game/hub`)
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await connection.start();

                if (isMatchmaking) {
                    // Join the matchmaking group
                    await connection.invoke('JoinMatchmaking', matchmakingId);
                } else {
                    // Join the game group
                    await connection.invoke('JoinGame', gameId);
                }

                // Set up event handlers
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

                // Only listen for GameStartedAfterMatchmaking when in matchmaking mode
                if (isMatchmaking) {
                    connection.on('GameStartedAfterMatchmaking', async (data: any) => {
                        // Immediately switch to game group to catch GameUpdated events
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

            } catch (err) {
                console.error('SignalR connection error:', err);
            }
        };

        startConnection();

        return () => {
            connection.stop();
        };
    }, [gameId, matchmakingId]); // <- gameId i matchmakingId
}
