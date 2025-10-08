'use client';

import { MainCompetitionScreen } from './MainCompetitionScreen';
import { GameUpdatedDto } from '@/types/game';

export function MainCompetitionDemo({ onBack }: { onBack?: () => void }) {
    const mockGameData: GameUpdatedDto = {
        gameId: "a3f4e1b2-c3d4-e5f6-a7b8-c9d0e1f2a3b4",
        schemaVersion: 1,
        status: "MainCompetition",
        nextStatus: null,
        changeType: "Snapshot",
        preDraftsCount: 2,
        header: {
            draftOrderPolicy: "Classic",
            draftTimeoutInSeconds: 30,
            hill: {
                name: "Wielka Krokiew",
                location: "Zakopane",
                k: 125,
                hs: 140,
                countryFisCode: "POL",
                alpha2Code: "PL"
            },
            players: [
                { playerId: "player1", nick: "Kamil Stoch Fan", isBot: false },
                { playerId: "player2", nick: "Halvor Enjoyer", isBot: false },
                { playerId: "player3", nick: "Bot Adam", isBot: true },
                { playerId: "player4", nick: "Bot Piotr", isBot: true },
            ],
            jumpers: Array.from({ length: 50 }, (_, i) => ({
                gameJumperId: `j${i + 1}`,
                gameWorldJumperId: `gwj${i + 1}`,
                name: `Jumper`,
                surname: `#${i + 1}`,
                countryFisCode: ["POL", "NOR", "GER", "AUT", "SLO", "JPN"][i % 6],
            })),
            competitionJumpers: Array.from({ length: 50 }, (_, i) => ({
                gameJumperId: `j${i + 1}`,
                competitionJumperId: `cj${i + 1}`,
                name: `Jumper`,
                surname: `#${i + 1}`,
                countryFisCode: ["POL", "NOR", "GER", "AUT", "SLO", "JPN"][i % 6],
            })),
        },
        preDraft: null,
        endedPreDraft: null,
        draft: {
            currentPlayerId: null,
            timeoutInSeconds: 0,
            ended: true,
            orderPolicy: "Classic",
            picks: [
                { playerId: "player1", jumperIds: ["j50", "j48", "j46", "j44", "j42", "j40", "j38", "j36", "j34", "j32"] }, // Top jumpers
                { playerId: "player2", jumperIds: ["j49", "j47", "j45", "j43", "j41", "j39", "j37", "j35", "j33", "j31"] }, // Second best
                { playerId: "player3", jumperIds: ["j30", "j28", "j26", "j24", "j22", "j20", "j18", "j16", "j14", "j12"] },
                { playerId: "player4", jumperIds: ["j29", "j27", "j25", "j23", "j21", "j19", "j17", "j15", "j13", "j11"] },
            ],
            availableJumpers: [],
            nextPlayers: [],
        },
        mainCompetition: {
            status: "RoundInProgress",
            roundIndex: 1, // Currently in round 2 (0-indexed)
            startlist: Array.from({ length: 50 }, (_, i) => ({
                bib: 50 - i,
                done: i >= 20, // First 20 jumpers have jumped
                competitionJumperId: `cj${50 - i}`,
            })),
            gateState: {
                starting: 10,
                currentJury: 10,
                coachReduction: null
            },
            toBeatDistance: 142.3,
            results: Array.from({ length: 20 }, (_, i) => {
                const hasSecondRound = i < 15;
                const firstRoundPoints = 140 - i * 1.5;
                const secondRoundPoints = hasSecondRound ? 135 - i * 1.2 : 0;
                return {
                    rank: i + 1,
                    bib: 50 - i,
                    competitionJumperId: `cj${50 - i}`,
                    total: firstRoundPoints + secondRoundPoints,
                    rounds: [
                        {
                            gameJumperId: `j${50 - i}`,
                            competitionJumperId: `cj${50 - i}`,
                            distance: 130 - i * 2,
                            points: 140 - i * 1.5,
                            judges: [18.5, 18.0, 18.5, 18.5, 19.0],
                            judgePoints: 55.5,
                            windCompensation: 2.1,
                            windAverage: -0.5,
                            gate: 10,
                            gateCompensation: 0,
                            totalCompensation: 2.1
                        },
                        // Add second round for some jumpers
                        ...(i < 15 ? [{
                            gameJumperId: `j${50 - i}`,
                            competitionJumperId: `cj${50 - i}`,
                            distance: 128 - i * 1.5,
                            points: 135 - i * 1.2,
                            judges: [18.0, 17.5, 18.0, 17.5, 18.0],
                            judgePoints: 54.0,
                            windCompensation: -1.5,
                            windAverage: 0.8,
                            gate: 9,
                            gateCompensation: 1.2,
                            totalCompensation: -0.3
                        }] : [])
                    ]
                };
            }),
            nextJumpInMilliseconds: 4500,
            nextJumperId: "cj30",
        },
        break: null,
        ended: null,
        lastCompetitionState: null, // Simplified for demo
        lastCompetitionResultDto: {
            gameJumperId: 'j31',
            competitionJumperId: 'cj31',
            distance: 128.5,
            points: 135.2,
            judges: [18.0, 18.5, 18.0, 18.5, 18.0],
            judgePoints: 54.5,
            windCompensation: 1.2,
            windAverage: -0.3,
            gate: 10,
            gateCompensation: 0.0,
            totalCompensation: 1.2,
        },
    };

    return (
        <MainCompetitionScreen
            gameData={mockGameData}
            myPlayerId="player1"
            myDraftedJumperIds={["j50", "j48", "j46", "j44", "j42", "j40", "j38", "j36", "j34", "j32"]}
            allDraftPicks={mockGameData.draft?.picks}
            onBack={onBack}
        />
    );
}
