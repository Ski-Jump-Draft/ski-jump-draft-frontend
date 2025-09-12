import { useEffect, useRef } from 'react';

export interface GameCreatedEvent {
    type: 'gameCreated';
    gameId: string;
    eventTimestampUtc: string;
    scheduledNextPhaseAtUtc: string;
    serverTimeUtc?: string;
}

export interface HillChoiceStartedEvent {
    type: 'hillChoiceStarted';
    hill: {
        id: string;
        location: string;
        k: number;
        hs: number;
        countryCode: string;
    };
    eventTimestampUtc: string;
    scheduledNextPhaseAtUtc: string;
}
export interface HillChoiceEndedEvent {
    type: 'hillChoiceEnded';
    eventTimestampUtc: string;
    scheduledNextPhaseAtUtc: string;
}
export interface PreDraftStartedEvent {
    type: 'preDraftStarted';
}

export type GameHubEvent =
    | GameCreatedEvent
    | HillChoiceStartedEvent
    | HillChoiceEndedEvent
    | PreDraftStartedEvent;

export function useGameHubStream(
    gameId: string | null,
    onEvent: (ev: GameHubEvent) => void,
): void {
    // trzyma stale aktualną referencję do onEvent (nie wywoła useEffect przy każdej zmianie funkcji!)
    const onEventRef = useRef(onEvent);
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

    useEffect(() => {
        if (!gameId) return;

        const base =
            process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
        const es = new EventSource(`${base}/game/stream?gameId=${gameId}`);

        const parse = (e: MessageEvent<any>) => JSON.parse(e.data ?? '{}');

        const wrap = <T extends GameHubEvent['type']>(type: T) =>
            (e: MessageEvent) => {
                const d = parse(e);
                onEventRef.current({ type, ...d } as GameHubEvent);
            };

        es.addEventListener('gameCreated', wrap('gameCreated'));
        es.addEventListener('hillChoiceStarted', wrap('hillChoiceStarted'));
        es.addEventListener('hillChoiceEnded', wrap('hillChoiceEnded'));
        es.addEventListener('preDraftStarted', wrap('preDraftStarted'));

        return () => {
            es.close();
        };
    }, [gameId]); // <- tylko gameId!

}
