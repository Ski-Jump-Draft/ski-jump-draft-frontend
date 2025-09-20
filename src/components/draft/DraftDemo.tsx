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
            const round: CompetitionRoundResultDto = {
                gameJumperId: jumpers[i].gameJumperId,
                competitionJumperId: competitionJumpers[i].competitionJumperId,
                distance: 120 + (i % 15),
                points: 20 + (i % 10),
                windAverage: 0.5,
                totalCompensation: 0,
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
            hillId: null,
            players,
            jumpers,
            competitionJumpers,
            draftOrderPolicy: 'Classic',
            draftTimeoutInSeconds: 30,
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
                orderPolicy: 'Classic',
                picks,
                availableJumpers: [],
                nextPlayers: players.map(p => p.playerId),
            },
            mainCompetition: null,
            break: null,
            ended: null,
            lastCompetitionState: null,
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


