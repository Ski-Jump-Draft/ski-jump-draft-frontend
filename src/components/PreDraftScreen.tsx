'use client';

import { useState, useEffect } from 'react';
import { GameUpdatedDto, PreDraftDto, StartlistEntryDto, PlayerWithBotFlagDto, JumperDetailsDto, PreDraftSessionDto } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, User, Clock, Flag } from 'lucide-react';

interface PreDraftScreenProps {
    gameData: GameUpdatedDto;
    startlist: StartlistEntryDto[];
    players: PlayerWithBotFlagDto[];
    sessions: PreDraftSessionDto[];
    currentJumperDetails?: JumperDetailsDto;
    nextJumpInSeconds?: number;
    jumpersRemainingInSession: number;
}

export function PreDraftScreen({
    gameData,
    startlist,
    players,
    sessions,
    currentJumperDetails,
    nextJumpInSeconds = 0,
    jumpersRemainingInSession
}: PreDraftScreenProps) {
    const [activeSession, setActiveSession] = useState(1);
    const [countdown, setCountdown] = useState(nextJumpInSeconds);

    useEffect(() => {
        // Reset countdown when backend provides a new timer or a new jump cycle starts
        // Key on progress bar ensures immediate reset, transition provides smooth animation
        const limitedCountdown = Math.min(nextJumpInSeconds, 6);
        setCountdown(limitedCountdown);
    }, [
        nextJumpInSeconds,
        // Also restart when a new result/jump arrives even if value stays the same
        gameData?.lastCompetitionResultDto,
        gameData?.preDraft?.competition?.nextJumperId,
    ]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Mock current jumper ID for demonstration
    const currentJumperId = currentJumperDetails?.gameJumperId;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
    };

    const getCountryFlag = (countryCode: string) => {
        // Map FIS country codes to flag files
        const flagMap: Record<string, string> = {
            'GER': 'de.svg',
            'POL': 'pl.svg',
            'AUT': 'at.svg',
            'NOR': 'no.svg',
            'JAP': 'jp.svg',
            'SLO': 'si.svg',
            'SUI': 'ch.svg',
            'USA': 'us.svg',
            'FIN': 'fi.svg',
            'CZE': 'cz.svg',
            'RUS': 'ru.svg',
            "EST": "ee.svg",
            'FRA': 'fr.svg',
            'ITA': 'it.svg',
            'SWE': 'se.svg',
            'CAN': 'ca.svg',
            "ROU": "ro.svg",
            "UKR": "ua.svg",
            "BUL": "bg.svg",
            "KAZ": "kz.svg",
            "TUR": "tr.svg",
            "CHN": "cn.svg",
            "SVK": "sk.svg",
            "KOR": "kr.svg",

        };
        return `/flags/${flagMap[countryCode] || 'xx.svg'}`;
    };

    const activeSessionData = sessions.find(s => s.sessionNumber === activeSession);

    // Resolve next jumper display data from backend helper or competition results
    const nextJumperId = gameData.preDraft?.competition?.nextJumperId || null;
    // In real data, nextJumperId is competitionJumperId, so search in competitionJumpers
    const nextJumperInfo = nextJumperId
        ? gameData.header.competitionJumpers?.find(cj => cj.competitionJumperId === nextJumperId)
        : undefined;
    const nextJumperDisplay = nextJumperInfo
        ? { name: nextJumperInfo.name, surname: nextJumperInfo.surname, countryFisCode: nextJumperInfo.countryFisCode }
        : undefined;


    return (
        <div className="min-h-screen bg-background p-4 lg:p-6 flex flex-col">
            {/* Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 flex-shrink-0">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 lg:gap-4 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Faza Obserwacji</h1>
                        <span className="text-base lg:text-lg text-muted-foreground">
                            Sesja {gameData.preDraft?.index !== undefined ? gameData.preDraft.index + 1 : 1}/{gameData.preDraftsCount}
                        </span>
                    </div>
                    <p className="text-xs lg:text-sm text-muted-foreground max-w-2xl">
                        Obserwuj skoki zawodników i planuj swoje wybory w Draft. Pamiętaj, że w treningach nie ma not za styl,
                        a nie wszyscy skaczą na pełnię swoich możliwości.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-green-600 text-white px-3 lg:px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="text-xl lg:text-2xl font-bold">{jumpersRemainingInSession}</span>
                        <span className="text-xs lg:text-sm">skoczków do końca sesji</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden">
                {/* Left Sidebar - Start List & Players */}
                <div className="lg:w-1/4 space-y-4 lg:space-y-6 flex flex-col h-full">
                    {/* Start List - 3/5 of height */}
                    <Card className="p-3 lg:p-4 flex flex-col" style={{ height: '60%', maxHeight: '60vh' }}>
                        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex-shrink-0">Lista startowa</h3>
                        <div className="space-y-1 lg:space-y-2 flex-1 overflow-y-auto">
                            {startlist.map((entry, index) => {
                                // In real data, nextJumperId is already competitionJumperId
                                const nextJumperId = gameData.preDraft?.competition?.nextJumperId;
                                const isNextJumper = entry.jumperId === nextJumperId;
                                const isCompleted = activeSessionData?.results.some(r => r.competitionJumperId === entry.jumperId);


                                return (
                                    <div
                                        key={`startlist-${entry.bib}`}
                                        className={`flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg transition-colors ${isNextJumper
                                            ? 'bg-slate-500/15 border border-slate-400/30'
                                            : isCompleted
                                                ? 'opacity-50 hover:bg-muted/30'
                                                : 'hover:bg-muted/50'
                                            }`}
                                    >
                                        <span className={`text-xs lg:text-sm font-mono w-5 lg:w-6 ${isNextJumper ? 'text-slate-300 font-semibold' :
                                            isCompleted ? 'text-muted-foreground' : 'text-muted-foreground'
                                            }`}>
                                            {entry.bib}
                                        </span>
                                        <img
                                            src={getCountryFlag(entry.countryFisCode)}
                                            alt={entry.countryFisCode}
                                            className={`w-5 h-3 lg:w-6 lg:h-4 object-cover rounded ${isCompleted ? 'opacity-50' : ''
                                                }`}
                                        />
                                        <span className={`text-xs lg:text-sm font-medium flex-1 truncate ${isNextJumper ? 'text-slate-300 font-semibold' :
                                            isCompleted ? 'text-muted-foreground' : 'text-foreground'
                                            }`}>
                                            {entry.name} {entry.surname}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Players - 2/5 of height */}
                    <Card className="p-3 lg:p-4 flex flex-col" style={{ height: '40%', maxHeight: '40vh' }}>
                        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex-shrink-0">Gracze</h3>
                        <div className="space-y-1 lg:space-y-2 flex-1 overflow-y-auto">
                            {players.map((player) => (
                                <div key={player.playerId} className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    {player.isBot ? (
                                        <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                                    ) : (
                                        <User className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                                    )}
                                    <span className="text-sm lg:font-medium text-foreground truncate">{player.nick}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Center - Results Table */}
                <div className="lg:w-1/2 flex flex-col">
                    <Card className="p-3 lg:p-4 flex-1 flex flex-col max-h-[85vh]">
                        <div className="flex gap-2 mb-4 flex-shrink-0">
                            {sessions.map((session) => (
                                <Button
                                    key={session.sessionNumber}
                                    variant={activeSession === session.sessionNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setActiveSession(session.sessionNumber)}
                                    className={activeSession === session.sessionNumber ? "bg-red-600 hover:bg-red-700" : ""}
                                >
                                    Sesja {session.sessionNumber}
                                </Button>
                            ))}
                        </div>

                        <div className="overflow-y-auto lg:overflow-y-auto flex-1 min-h-0">
                            <div className="space-y-1">
                                {activeSessionData?.results
                                    .sort((a, b) => a.rank - b.rank) // Sort by rank ascending
                                    .map((result, index) => {
                                        // Find jumper details from competitionJumpers
                                        const jumper = gameData.header.competitionJumpers?.find(
                                            cj => cj.competitionJumperId === result.competitionJumperId
                                        );

                                        // Check if this is the last jumper who jumped (from lastCompetitionResultDto)
                                        const lastJumperId = gameData.lastCompetitionResultDto?.competitionJumperId;
                                        const isLastAdded = result.competitionJumperId === lastJumperId;
                                        return (
                                            <div
                                                key={result.competitionJumperId}
                                                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-500 ease-in-out ${isLastAdded ? 'bg-yellow-500/10 border border-yellow-500/30' : 'hover:bg-muted/50'
                                                    }`}
                                            >
                                                <span className="text-sm font-mono text-muted-foreground w-8">{result.rank}</span>
                                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${jumper?.name || 'Unknown'}`}
                                                        alt={jumper?.name || 'Unknown'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <img
                                                    src={getCountryFlag(jumper?.countryFisCode || 'UNK')}
                                                    alt={jumper?.countryFisCode || 'UNK'}
                                                    className="w-6 h-4 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <span className="font-medium text-foreground">
                                                        {jumper?.name || 'Unknown'} {jumper?.surname || 'Jumper'}
                                                    </span>
                                                </div>
                                                <div className="text-right" style={{ marginLeft: '-20px' }}>
                                                    <div className="text-sm font-mono text-foreground">
                                                        {result.rounds[result.rounds.length - 1]?.distance.toFixed(1)}m
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {result.rounds[result.rounds.length - 1]?.points.toFixed(1)}p
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Sidebar - Countdown & Jumper Details */}
                <div className="lg:w-1/4 space-y-4 lg:space-y-6 flex flex-col">
                    {/* Next Jump Countdown */}
                    <Card className="p-3 lg:p-4 flex-shrink-0">
                        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex items-center gap-2">
                            <span>Następny skok:</span>
                            {nextJumperDisplay && (
                                <>
                                    <img
                                        src={getCountryFlag(nextJumperDisplay.countryFisCode)}
                                        alt={nextJumperDisplay.countryFisCode}
                                        className="w-6 h-4 object-cover rounded"
                                    />
                                    <span className="font-bold text-foreground">
                                        {nextJumperDisplay.name} {nextJumperDisplay.surname}
                                    </span>
                                </>
                            )}
                        </h3>
                        <div className="relative bg-muted rounded-lg overflow-hidden">
                            <div
                                key={`progress-${gameData?.lastCompetitionResultDto?.competitionJumperId || 'initial'}`}
                                className="h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg transition-all duration-1000 ease-linear"
                                style={{ width: `${((6 - countdown) / 6) * 100}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-white drop-shadow-lg">
                                    {countdown}s
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Current Jumper Details */}
                    {currentJumperDetails && (
                        <Card key={currentJumperDetails.gameJumperId + String(currentJumperDetails.lastJumpResult?.points)} className="p-3 lg:p-4 flex-shrink-0 animate-card-reveal reveal-shader-top">
                            <div className="space-y-4">
                                {/* Jumper Photo & Basic Info - Compact Layout */}
                                <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={currentJumperDetails.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentJumperDetails.name}`}
                                            alt={currentJumperDetails.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-lg text-foreground">
                                                {currentJumperDetails.name} {currentJumperDetails.surname}
                                            </h4>
                                            <img
                                                src={getCountryFlag(currentJumperDetails.countryFisCode)}
                                                alt={currentJumperDetails.countryFisCode}
                                                className="w-6 h-4 object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Jump Results */}
                                {currentJumperDetails.lastJumpResult && (
                                    <div className="space-y-6 bg-muted/30 p-4 rounded-lg">
                                        {/* Distance and Position - Closer together */}
                                        <div className="flex justify-center gap-8">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-foreground">
                                                    {currentJumperDetails.lastJumpResult.distance.toFixed(1)}m
                                                </div>
                                                <div className="text-sm text-muted-foreground">Odległość</div>
                                            </div>
                                            <div className="text-center">
                                                {typeof currentJumperDetails.currentPosition === 'number' ? (
                                                    <div className="text-2xl font-bold text-foreground">
                                                        {currentJumperDetails.currentPosition}
                                                    </div>
                                                ) : null}
                                                <div className="text-sm text-muted-foreground">miejsce</div>
                                            </div>
                                        </div>

                                        {/* Divider after first line */}
                                        <div className="border-t border-border/50"></div>

                                        {/* Judge Scores */}
                                        {(currentJumperDetails.lastJumpResult.judges && currentJumperDetails.lastJumpResult.judgePoints != null) && (
                                            <div>
                                                <div className="grid grid-cols-5 gap-1 text-center mb-2">
                                                    {currentJumperDetails.lastJumpResult.judges.slice(0, 5).map((score, index) => (
                                                        <div key={index} className="text-sm font-mono">
                                                            {score.toFixed(1)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-muted-foreground text-center">
                                                    Noty sędziowskie ({currentJumperDetails.lastJumpResult.judgePoints?.toFixed(1)}p)
                                                </div>
                                            </div>
                                        )}

                                        {/* Compensation Points - Horizontal Layout */}
                                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                            {currentJumperDetails.gatePoints != null && (
                                                <div>
                                                    <div className={`text-base font-medium ${currentJumperDetails.gatePoints > 0 ? 'text-green-400' :
                                                        currentJumperDetails.gatePoints < 0 ? 'text-red-400' : 'text-muted-foreground'
                                                        }`}>
                                                        {currentJumperDetails.gatePoints >= 0 ? '+' : ''}{currentJumperDetails.gatePoints.toFixed(1)}p
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">za belkę</div>
                                                </div>
                                            )}
                                            <div>
                                                <div className={`text-2xl font-bold ${currentJumperDetails.totalCompensation !== undefined && currentJumperDetails.totalCompensation > 0 ? 'text-green-500' :
                                                    currentJumperDetails.totalCompensation !== undefined && currentJumperDetails.totalCompensation < 0 ? 'text-red-500' : 'text-foreground'
                                                    }`}>
                                                    {currentJumperDetails.totalCompensation !== undefined && currentJumperDetails.totalCompensation >= 0 ? '+' : ''}{currentJumperDetails.totalCompensation?.toFixed(1)}p
                                                </div>
                                                <div className="text-xs text-muted-foreground">łącznie</div>
                                            </div>
                                            {currentJumperDetails.windPoints != null && (
                                                <div>
                                                    <div className={`text-base font-medium ${currentJumperDetails.windPoints > 0 ? 'text-green-400' :
                                                        currentJumperDetails.windPoints < 0 ? 'text-red-400' : 'text-muted-foreground'
                                                        }`}>
                                                        {currentJumperDetails.windPoints >= 0 ? '+' : ''}{currentJumperDetails.windPoints.toFixed(1)}p
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">za wiatr</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Total Score */}
                                        <div className="text-center pt-2 border-t border-border">
                                            <div className="text-lg font-bold text-foreground">
                                                {currentJumperDetails.totalScore?.toFixed(1)} punktów
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
