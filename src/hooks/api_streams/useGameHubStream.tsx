import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr';
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
            .withUrl(`${base}/game/hub`, {
                transport: HttpTransportType.WebSockets, // prefer WS
                withCredentials: true,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (ctx) => {
                    // Exponential backoff with cap (0s, 2s, 5s, 10s, 30s, 30s...)
                    const delays = [0, 2000, 5000, 10000, 30000];
                    return delays[Math.min(ctx.previousRetryCount, delays.length - 1)];
                },
            })
            .configureLogging(process.env.NODE_ENV === 'production' ? LogLevel.Information : LogLevel.Debug)
            .build();

        const startConnection = async () => {
            try {
                // Tune timeouts/keep-alives client-side
                // Default server timeout ~30s; extend a bit to tolerate short stalls
                (connection as any).serverTimeoutInMilliseconds = 60_000; // 60s without messages before timing out
                (connection as any).keepAliveIntervalInMilliseconds = 15_000; // send ping ~15s

                // Register handlers BEFORE start to avoid missing early messages
                connection.off('GameUpdated');
                connection.on('GameUpdated', (data: GameUpdatedDto) => {
                    onEventRef.current({ type: 'gameUpdated', data });
                });

                connection.off('GameEnded');
                connection.on('GameEnded', (gameId: string) => {
                    onEventRef.current({ type: 'gameEnded', gameId });
                });

                if (isMatchmaking) {
                    connection.off('GameStartedAfterMatchmaking');
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
                            playersMapping: data.playersMapping,
                        });
                    });
                }

                // Wire reconnect telemetry
                connection.onreconnecting(error => {
                    console.warn('SignalR reconnecting...', error);
                });
                connection.onreconnected(connectionId => {
                    console.info('SignalR reconnected', connectionId);
                    // Automatic reconnect preserves connectionId when possible; groups should remain.
                    // We intentionally DO NOT re-invoke JoinGame/JoinMatchmaking here per product requirement.
                });

                await connection.start();
                console.log('SignalR connection started.');

                if (isMatchmaking) {
                    await connection.invoke('JoinMatchmaking', matchmakingId);
                } else {
                    await connection.invoke('JoinGame', gameId);
                }

                connection.onclose(async (error) => {
                    console.error('SignalR connection closed after retries:', error);
                    if (onDisconnected) onDisconnected();
                    // Last resort: try to fully restart after a short delay (this will re-Join group)
                    try {
                        await new Promise(r => setTimeout(r, 1500));
                        if (connection.state === 'Disconnected') {
                            await connection.start();
                            if (isMatchmaking) {
                                await connection.invoke('JoinMatchmaking', matchmakingId);
                            } else {
                                await connection.invoke('JoinGame', gameId);
                            }
                            console.info('SignalR hard-restarted after close.');
                        }
                    } catch (e) {
                        console.error('SignalR hard-restart failed:', e);
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
