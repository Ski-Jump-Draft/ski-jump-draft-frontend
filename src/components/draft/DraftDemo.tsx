'use client';

import { useMemo } from 'react';
import { DraftScreen } from './DraftScreen';
import type {
    GameUpdatedDto,
    GameHeaderDto,
    GamePlayerDto,
    GameJumperDto,
    CompetitionJumperDto,
    CompetitionResultDto,
    CompetitionRoundResultDto,
    EndedCompetitionResults,
    PlayerPicksDto,
} from '@/types/game';

interface DraftDemoProps {
    onBack?: () => void;
}

export const DraftDemo = ({ onBack }: DraftDemoProps) => {
    const { data, myPlayerId } = useMemo(() => {
        const players: GamePlayerDto[] = Array.from({ length: 8 }).map((_, i) => ({
            playerId: `p${i + 1}`,
            nick: `Gracz ${i + 1}`,
            isBot: i % 3 === 0,
        }));

        const jumpers: GameJumperDto[] = Array.from({ length: 120 }).map((_, i) => ({
            gameJumperId: `j${i + 1}`,
            gameWorldJumperId: `wj${i + 1}`,
            name: `Imię${i + 1}`,
            surname: `Nazwisko${i + 1}`,
            countryFisCode: i % 2 === 0 ? 'POL' : 'NOR',
        }));

        const competitionJumpers: CompetitionJumperDto[] = jumpers.map((j, i) => ({
            gameJumperId: j.gameJumperId,
            competitionJumperId: `cj${i + 1}`,
            name: j.name,
            surname: j.surname,
            countryFisCode: j.countryFisCode,
        }));

        const results: CompetitionResultDto[] = Array.from({ length: 80 }).map((_, i) => {
            const windComp = Math.random() > 0.2 ? (Math.random() - 0.5) * 10 : null; // 80% ma rekompensatę
            const gateComp = Math.random() > 0.1 ? (Math.random() - 0.5) * 8 : null;  // 90% ma rekompensatę
            const totalComp = (windComp || 0) + (gateComp || 0);
            const gate = 20 + Math.floor((Math.random() - 0.5) * 6); // 17-23

            const round: CompetitionRoundResultDto = {
                gameJumperId: jumpers[i].gameJumperId,
                competitionJumperId: competitionJumpers[i].competitionJumperId,
                distance: 120 + (i % 15),
                points: 20 + (i % 10) + totalComp,
                judges: [18.5, 19.0, 18.5, 19.0, 18.5],
                judgePoints: 18.5 + (Math.random() - 0.5) * 2,
                windCompensation: windComp,
                windAverage: (Math.random() - 0.5) * 4, // -2 to +2 m/s
                gate: gate,
                gateCompensation: gateComp,
                totalCompensation: totalComp,
            };
            return {
                rank: i + 1,
                bib: i + 1,
                competitionJumperId: competitionJumpers[i].competitionJumperId,
                total: 100 + (80 - i) * 1.1,
                rounds: [round],
            };
        });

        const endedCompetitions: EndedCompetitionResults[] = [
            { results },
        ];

        // Create some picks to overflow the right column
        const picks: PlayerPicksDto[] = players.map((p, idx) => ({
            playerId: p.playerId,
            jumperIds: Array.from({ length: 10 - (idx % 3) }).map((_, k) => jumpers[(idx * 10 + k) % jumpers.length].gameJumperId),
        }));

        const header: GameHeaderDto = {
            hill: {
                name: 'Wielka Krokiew',
                location: 'Zakopane',
                k: 125,
                hs: 140,
                countryFisCode: 'POL',
                alpha2Code: 'pl'
            },
            players,
            jumpers,
            competitionJumpers,
            draftOrderPolicy: 'Snake',
            draftTimeoutInSeconds: 30,
            draftPicksCount: 5,
            rankingPolicy: 'Classic',
        };

        const data: GameUpdatedDto = {
            gameId: 'demo-game',
            schemaVersion: 1,
            status: 'Draft',
            nextStatus: null,
            changeType: 'Snapshot',
            preDraftsCount: 1,
            header,
            preDraft: null,
            endedPreDraft: { endedCompetitions },
            draft: {
                currentPlayerId: players[1].playerId, // not me, to block real picks
                timeoutInSeconds: 30,
                ended: false,
                orderPolicy: 'Snake',
                picks,
                availableJumpers: [],
                nextPlayers: players.map(p => p.playerId),
            },
            mainCompetition: null,
            break: null,
            ended: null,
            lastCompetitionState: {
                gateState: { starting: 20, currentJury: 20, coachReduction: 0 }, // Starting gate for tooltip comparison
                results: results,
                startlist: [],
                status: 'RoundInProgress',
                roundIndex: 1,
                nextJumpInMilliseconds: null,
            },
            lastCompetitionResultDto: null,
        };

        const myPlayerId = players[0].playerId;
        return { data, myPlayerId };
    }, []);

    return (
        <div className="fixed inset-0 z-50">
            <DraftScreen gameData={data} myPlayerId={myPlayerId} />
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 z-[60] px-3 py-1.5 rounded-md bg-neutral-800/80 border border-neutral-600 text-white hover:bg-neutral-700"
                >
                    Wróć
                </button>
            )}
        </div>
    );
};


