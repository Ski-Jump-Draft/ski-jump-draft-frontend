import { GameUpdatedDto, StartlistEntryDto, PlayerWithBotFlagDto, JumperDetailsDto, PreDraftSessionDto } from '@/types/game';

export function mapGameDataToPreDraftProps(game: GameUpdatedDto) {
    const comp = game.preDraft?.competition || null;

    // Use startlist from CompetitionDto if available, otherwise fallback to header.jumpers
    const startlist: StartlistEntryDto[] = comp?.startlist
        ? comp.startlist.map(startlistJumper => {
            // Find jumper details in header.competitionJumpers by competitionJumperId
            const competitionJumper = game.header.competitionJumpers?.find(
                cj => cj.competitionJumperId === startlistJumper.competitionJumperId
            );

            return {
                bib: startlistJumper.bib,
                jumperId: startlistJumper.competitionJumperId,
                name: competitionJumper?.name || 'Unknown',
                surname: competitionJumper?.surname || 'Jumper',
                countryFisCode: competitionJumper?.countryFisCode || 'UNK',
            };
        })
        : game.header.jumpers.map(jumper => ({
            bib: jumper.bib || 0,
            jumperId: jumper.gameJumperId,
            name: jumper.name,
            surname: jumper.surname,
            countryFisCode: jumper.countryFisCode,
        }));

    const players: PlayerWithBotFlagDto[] = game.header.players.map(player => ({
        playerId: player.playerId,
        nick: player.nick,
        isBot: player.isBot,
    }));

    const sessions: PreDraftSessionDto[] = comp
        ? [{
            sessionNumber: (game.preDraft?.index ?? 0) + 1,
            results: comp.results || [],
            isActive: true,
            nextJumpInSeconds: comp.nextJumpInSeconds ?? undefined,
        }]
        : [];

    // If backend provides lastCompetitionResultDto, prefer it. Otherwise derive from competition results
    let currentJumperDetails: JumperDetailsDto | undefined = undefined;
    if (game.lastCompetitionResultDto) {
        const r = game.lastCompetitionResultDto;
        // Find the jumper by gameJumperId in header.competitionJumpers
        const jumper = game.header.competitionJumpers?.find(j => j.gameJumperId === r.gameJumperId);

        if (jumper) {
            currentJumperDetails = {
                gameJumperId: jumper.gameJumperId,
                competitionJumperId: jumper.competitionJumperId,
                name: jumper.name,
                surname: jumper.surname,
                countryFisCode: jumper.countryFisCode,
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(jumper.name)}`,
                lastJumpResult: {
                    gameJumperId: r.gameJumperId,
                    competitionJumperId: r.competitionJumperId,
                    distance: r.distance,
                    points: r.points,
                    judges: r.judges ?? null,
                    judgePoints: r.judgePoints ?? null,
                    windCompensation: r.windCompensation ?? null,
                    windAverage: r.windAverage,
                    gateCompensation: r.gateCompensation ?? null,
                    totalCompensation: r.totalCompensation,
                },
                // Find position from competition results
                currentPosition: comp?.results?.find(result =>
                    result.competitionJumperId === jumper.competitionJumperId
                )?.rank as number | undefined,
                gatePoints: r.gateCompensation ?? undefined,
                windPoints: r.windCompensation ?? undefined,
                totalCompensation: r.totalCompensation,
                totalScore: r.points,
            };
        }
    } else if (comp?.results && comp.results.length > 0) {
        const lastResult = comp.results[comp.results.length - 1];
        const lastRound = lastResult.rounds[lastResult.rounds.length - 1];

        // Find jumper details from competitionJumpers
        const jumper = game.header.competitionJumpers?.find(
            cj => cj.competitionJumperId === lastResult.competitionJumperId
        );

        if (jumper) {
            currentJumperDetails = {
                gameJumperId: jumper.gameJumperId,
                competitionJumperId: jumper.competitionJumperId,
                name: jumper.name,
                surname: jumper.surname,
                countryFisCode: jumper.countryFisCode,
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(jumper.name)}`,
                lastJumpResult: {
                    gameJumperId: lastRound.gameJumperId,
                    competitionJumperId: lastRound.competitionJumperId,
                    distance: lastRound.distance,
                    points: lastRound.points,
                    judges: lastRound.judges ?? null,
                    judgePoints: lastRound.judgePoints ?? null,
                    windCompensation: lastRound.windCompensation ?? null,
                    windAverage: lastRound.windAverage,
                    gateCompensation: lastRound.gateCompensation ?? null,
                    totalCompensation: lastRound.totalCompensation,
                },
                currentPosition: lastResult.rank,
                gatePoints: lastRound.gateCompensation ?? undefined,
                windPoints: lastRound.windCompensation ?? undefined,
                totalCompensation: lastRound.totalCompensation,
                totalScore: lastRound.points,
            };
        }
    }

    const nextJumpInSeconds = comp?.nextJumpInSeconds ?? 0;
    const jumpersRemainingInSession = startlist.length - (comp?.results?.length ?? 0);

    return {
        gameData: game,
        startlist,
        players,
        sessions,
        currentJumperDetails,
        nextJumpInSeconds,
        jumpersRemainingInSession,
    };
}