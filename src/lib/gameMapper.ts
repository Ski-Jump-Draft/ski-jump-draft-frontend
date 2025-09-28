import { GameUpdatedDto, StartlistEntryDto, PlayerWithBotFlagDto, JumperDetailsDto, PreDraftSessionDto } from '@/types/game';

export function mapGameDataToPreDraftProps(game: GameUpdatedDto) {
    // Log last jump data for debugging
    if (game.lastCompetitionResultDto || game.status === "Break Draft") {
        console.log('=== LAST JUMP / BREAK DRAFT DATA ===');
        console.log('status:', game.status);
        console.log('preDraft:', !!game.preDraft);
        console.log('lastCompetitionState:', !!game.lastCompetitionState);
        console.log('lastCompetitionResultDto:', !!game.lastCompetitionResultDto);
        console.log('lastCompetitionState?.results length:', game.lastCompetitionState?.results?.length || 0);
        console.log('endedPreDraft?.endedCompetitions length:', game.endedPreDraft?.endedCompetitions?.length || 0);
        console.log('=============================');
    }
    const comp = game.preDraft?.competition || null;

    // Use startlist from CompetitionDto if available, otherwise fallback to header.jumpers
    // If competition is ended, use lastCompetitionState startlist
    const activeCompetition = comp || game.lastCompetitionState;
    const startlist: StartlistEntryDto[] = activeCompetition?.startlist
        ? activeCompetition.startlist.map(startlistJumper => {
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
            bib: 0, // GameJumperDto doesn't have bib, using default
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

    // Always show results from the last competition (current or lastCompetitionState)
    const activeComp = comp || game.lastCompetitionState;
    const sessions: PreDraftSessionDto[] = activeComp
        ? [{
            sessionNumber: (game.preDraft?.index ?? 0) + 1,
            results: activeComp.results || [],
            isActive: !!comp, // Only active if we have current competition
            nextJumpInMilliseconds: comp?.nextJumpInMilliseconds ?? undefined,
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
                    gate: r.gate,
                    gateCompensation: r.gateCompensation ?? null,
                    totalCompensation: r.totalCompensation,
                },
                // Find position from competition results (use lastCompetitionState if comp is null)
                currentPosition: (() => {
                    const activeComp = comp || game.lastCompetitionState;
                    const foundResult = activeComp?.results?.find(result =>
                        result.competitionJumperId === r.competitionJumperId
                    );
                    // Always calculate rank from sorted results for consistency
                    const sortedResults = activeComp?.results?.slice().sort((a, b) => b.total - a.total) || [];
                    const calculatedRank = sortedResults.findIndex(res => res.competitionJumperId === r.competitionJumperId) + 1;
                    console.log('Calculated rank for jumper', r.competitionJumperId, ':', calculatedRank, 'from', sortedResults.length, 'results');
                    return calculatedRank > 0 ? calculatedRank : undefined;
                })(),
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
                    gate: lastRound.gate,
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

    const nextJumpInSeconds = Math.floor((comp?.nextJumpInMilliseconds ?? 0) / 1000);
    const jumpersRemainingInSession = startlist.length - (activeComp?.results?.length ?? 0);

    // Check if we're in a break - either game.status is "Break" or NextStatus indicates a break
    const isBreak = (game.status === "Break" && game.break !== null) ||
        (game.nextStatus?.status === "PreDraftNextCompetition") ||
        (game.status === "Break Draft" && game.nextStatus?.status === "Draft");
    const breakRemainingSeconds = (game.nextStatus?.status === "PreDraftNextCompetition" ?
        parseInt(game.nextStatus.in.split(':')[2]) : 0) ??
        (game.nextStatus?.status === "Draft" ?
            parseInt(game.nextStatus.in.split(':')[2]) : 0);

    return {
        gameData: game,
        startlist,
        players,
        sessions,
        currentJumperDetails,
        nextJumpInSeconds,
        jumpersRemainingInSession,
        isBreak,
        breakRemainingSeconds,
        nextStatus: game.nextStatus,
    };
}