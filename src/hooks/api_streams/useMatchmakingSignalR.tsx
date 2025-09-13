import { useEffect, useRef } from 'react';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
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

export type MatchmakingSignalREvent = GameStartedAfterMatchmakingEvent | GameUpdatedEvent;

export function useMatchmakingSignalR(
    matchmakingId: string | null,
    onEvent: (ev: MatchmakingSignalREvent) => void,
): void {
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!matchmakingId) {
            console.log('useMatchmakingSignalR: no matchmakingId, skipping');
            return;
        }

        console.log('useMatchmakingSignalR: connecting for matchmakingId:', matchmakingId);
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5150';
        const connection = new HubConnectionBuilder()
            .withUrl(`${base}/game/hub`)
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await connection.start();
                console.log('SignalR Connected to GameHub for matchmaking');

                // Join the matchmaking group
                await connection.invoke('JoinMatchmaking', matchmakingId);
                console.log('Joined matchmaking group:', matchmakingId);

                // Set up event handlers
                connection.on('GameStartedAfterMatchmaking', (data: any) => {
                    const timestamp = new Date().toISOString();
                    console.log('🎯 Received GameStartedAfterMatchmaking event:', {
                        timestamp,
                        matchmakingId: data.matchmakingId,
                        gameId: data.gameId,
                        playersMapping: data.playersMapping
                    });
                    onEventRef.current({
                        type: 'gameStartedAfterMatchmaking',
                        matchmakingId: data.matchmakingId,
                        gameId: data.gameId,
                        playersMapping: data.playersMapping
                    });
                });

                // Also listen for GameUpdated events in matchmaking group
                connection.on('GameUpdated', (data: any) => {
                    const timestamp = new Date().toISOString();
                    console.log('🎮 GameUpdated received in matchmaking group:', {
                        timestamp,
                        gameId: data.gameId,
                        status: data.status,
                        nextStatus: data.nextStatus
                    });
                    // Forward to main component
                    onEventRef.current({
                        type: 'gameUpdated',
                        data: data
                    });
                });

                // Log all incoming events for debugging
                connection.on('*', (eventName: string, ...args: any[]) => {
                    console.log('SignalR event received:', eventName, args);
                });

                // Also try to catch any events that might come through
                connection.on('*', (eventName: string, ...args: any[]) => {
                    if (eventName.includes('Game') || eventName.includes('Started') || eventName.includes('Matchmaking')) {
                        console.log('Potential game event:', eventName, args);
                    }
                });

            } catch (err) {
                console.error('SignalR matchmaking connection error:', err);
            }
        };

        startConnection();

        return () => {
            connection.stop();
        };
    }, [matchmakingId]);
}
