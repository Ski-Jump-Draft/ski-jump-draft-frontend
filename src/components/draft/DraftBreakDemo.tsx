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

interface DraftBreakDemoProps {
    onBack?: () => void;
}

export const DraftBreakDemo = ({ onBack }: DraftBreakDemoProps) => {
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
                gate: 20,
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

        // Create complete picks - all players have drafted their teams
        const picks: PlayerPicksDto[] = players.map((p, idx) => ({
            playerId: p.playerId,
            jumperIds: Array.from({ length: 8 + (idx % 3) }).map((_, k) => jumpers[(idx * 10 + k) % jumpers.length].gameJumperId),
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
            draftTimeoutInSeconds: 45,
            draftPicksCount: 6,
            rankingPolicy: 'PodiumAtAllCosts',
        };

        const data: GameUpdatedDto = {
            gameId: 'demo-break-game',
            schemaVersion: 1,
            status: 'Break MainCompetition', // Break between draft and main competition
            nextStatus: {
                status: 'MainCompetition',
                in: '00:02:30', // 2 minutes 30 seconds until main competition starts
            },
            changeType: 'Snapshot',
            preDraftsCount: 1,
            header,
            preDraft: null,
            endedPreDraft: { endedCompetitions },
            draft: {
                currentPlayerId: null, // Draft is finished
                timeoutInSeconds: null,
                ended: true, // Draft has ended
                orderPolicy: 'Classic',
                picks,
                availableJumpers: [],
                nextPlayers: [],
            },
            mainCompetition: null,
            break: {
                next: 'MainCompetition',
            },
            ended: null,
            lastCompetitionState: null,
            lastCompetitionResultDto: null,
        };

        const myPlayerId = players[0].playerId;
        return { data, myPlayerId };
    }, []);

    return (
        <div className="fixed inset-0 z-50">
            <DraftScreen gameData={data} myPlayerId={myPlayerId} isReadOnly={true} />
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 z-[60] px-3 py-1.5 rounded-md bg-neutral-800/80 border border-neutral-600 text-white hover:bg-neutral-700"
                >
                    Wróć
                </button>
            )}
            {/* Break info overlay */}
            <div className="absolute top-4 right-4 z-[60] bg-blue-600/90 text-white px-4 py-2 rounded-lg border border-blue-500">
                <div className="text-sm font-semibold">Przerwa przed konkursem</div>
                <div className="text-xs opacity-90">Konkurs główny za 2:30</div>
            </div>
        </div>
    );
};
