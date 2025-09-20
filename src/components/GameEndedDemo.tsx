'use client';

import { GameEndedScreen } from './GameEndedScreen';

export function GameEndedDemo({ onBack }: { onBack?: () => void }) {
    const results = [
        { playerId: 'p1', nick: 'Siekam Cebulę', points: 16, position: 1, isMe: true },
        { playerId: 'p2', nick: 'Jezus Chrystus', points: 14, position: 2 },
        { playerId: 'p3', nick: 'Bot #6', points: 11, position: 3 },
        { playerId: 'p4', nick: 'Bot #133', points: 8, position: 4 },
        { playerId: 'p5', nick: 'Złoty Orzeł', points: 8, position: 4 },
        { playerId: 'p6', nick: 'Złoty Orzeł', points: 5, position: 6 },
        { playerId: 'p7', nick: 'Złoty Orzeł', points: 4, position: 7 },
        { playerId: 'p8', nick: 'Złoty Orzeł', points: 3, position: 8 },
        { playerId: 'p9', nick: 'Złoty Orzeł', points: 2, position: 9 },
        { playerId: 'p10', nick: 'Złoty Orzeł', points: 1, position: 10 },
        { playerId: 'p11', nick: 'Złoty Orzeł', points: 1, position: 10 },
        { playerId: 'p12', nick: 'Złoty Orzeł', points: 1, position: 10 },
        { playerId: 'p13', nick: 'Złoty Orzeł', points: 0, position: 13 },
        { playerId: 'p14', nick: 'Złoty Orzeł', points: 0, position: 14 },
    ];

    return (
        <GameEndedScreen
            title="SJ Draft – Zakopane HS140 🇵🇱"
            results={results}
            onBackToMenu={onBack}
            policy='Classic'
            shareUrl={typeof window !== 'undefined' ? window.location.origin : 'https://example.com'}
            myPlayerId={'p1'}
        />
    );
}
