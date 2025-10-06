'use client';

import { useState, useEffect, useRef } from 'react';
import { GameUpdatedDto, StartlistEntryDto, PlayerWithBotFlagDto, JumperDetailsDto, CompetitionDto } from '@/types/game';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fisToAlpha2 } from '@/utils/countryCodes';
import { Bot, User, Clock, Flag, Trophy, Info } from 'lucide-react';
import { SimplePhaseTimer } from '@/components/ui/SimplePhaseTimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AnimatedJumpingText } from '@/components/ui/AnimatedJumpingText';
import { JumpResultTooltip } from '@/components/ui/JumpResultTooltip';
import { StartList, StartListEntry } from '@/components/ui/StartList';

interface MainCompetitionScreenProps {
    gameData: GameUpdatedDto;
    myDraftedJumperIds: string[];
    myPlayerId: string;
    isEnded?: boolean;
    onBack?: () => void; // For demo mode
}

export function MainCompetitionScreen({
    gameData,
    myDraftedJumperIds,
    myPlayerId,
    isEnded,
    onBack
}: MainCompetitionScreenProps) {
    const [lastHighlightedJumper, setLastHighlightedJumper] = useState<string | null>(null);
    const [scoringDialogOpen, setScoringDialogOpen] = useState(false);

    const competition = gameData.mainCompetition ?? gameData.lastCompetitionState;
    const players = gameData.header.players;

    const nextJumpInMilliseconds = competition?.nextJumpInMilliseconds ?? 0;
    const [countdown, setCountdown] = useState(nextJumpInMilliseconds / 1000);
    const [initialCountdown, setInitialCountdown] = useState(nextJumpInMilliseconds / 1000);

    const isCompetitionEnded = isEnded || competition?.status === "Ended";

    useEffect(() => {
        // Reset countdown when backend provides a new timer or a new jump cycle starts
        const newCountdown = Math.floor(nextJumpInMilliseconds / 1000);
        setCountdown(newCountdown);
        setInitialCountdown(newCountdown);
    }, [
        nextJumpInMilliseconds,
        gameData?.lastCompetitionResultDto,
        competition?.nextJumperId,
    ]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    useEffect(() => {
        const newJumperId = gameData.lastCompetitionResultDto?.competitionJumperId;
        if (newJumperId && newJumperId !== lastHighlightedJumper) {
            setLastHighlightedJumper(newJumperId);
            const timer = setTimeout(() => {
                setLastHighlightedJumper(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [gameData.lastCompetitionResultDto?.competitionJumperId, lastHighlightedJumper]);



    const getCountryFlag = (countryCode: string) => {
        const alpha2Code = fisToAlpha2(countryCode) || 'xx';
        return `/flags/${alpha2Code}.svg`;
    };

    const nextJumperId = competition?.nextJumperId || null;
    const nextJumperInfo = nextJumperId
        ? gameData.header.competitionJumpers?.find(cj => cj.competitionJumperId === nextJumperId)
        : undefined;
    const nextJumperDisplay = nextJumperInfo
        ? { name: nextJumperInfo.name, surname: nextJumperInfo.surname, countryFisCode: nextJumperInfo.countryFisCode }
        : undefined;

    const jumpersRemainingInSession = competition?.startlist.filter(j => !j.done).length ?? 0;

    const myPicks = myDraftedJumperIds;
    const otherPicks = gameData.draft?.picks.filter(p => p.playerId !== myPlayerId).flatMap(p => p.jumperIds) ?? [];

    const lastJumpResult = gameData.lastCompetitionResultDto;
    const lastJumperDetails = lastJumpResult
        ? gameData.header.competitionJumpers.find(cj => cj.competitionJumperId === lastJumpResult.competitionJumperId)
        : null;
    const lastJumperRank = lastJumpResult
        ? competition?.results.find(r => r.competitionJumperId === lastJumpResult.competitionJumperId)?.rank
        : null;

    // Scoring rules logic (copied from GameEndedScreen)
    const policy = gameData.ended?.policy || "Classic";
    const policyLines = policy === "Classic"
        ? [
            "1 miejsce --> 10 punktów",
            "2 miejsce --> 9 punktów",
            "3 miejsce --> 8 punktów",
            "4 miejsce --> 7 punktów",
            "5 miejsce --> 6 punktów",
            "6-10 miejsce --> 5 punktów",
            "11-20 miejsce --> 3 punkty",
            "21-30 miejsce --> 1 punkt",
        ]
        : [
            "1 miejsce --> 15 punktów",
            "2 miejsce --> 15 punktów",
            "3 miejsce --> 15 punktów",
            "4-10 miejsce --> 5 punktów",
            "11-20 miejsce --> 2 punkty",
            "21-30 miejsce --> 1 punkt",
        ];

    const policySummary = policy === "Classic"
        ? "Punkty są liczone systemem klasycznym, który jest dość zrównoważony"
        : "Punkty są liczone systemem, który szczególnie nagradza miejsca na podium";


    return (
        <div className={cn("min-h-screen bg-background p-4 lg:p-6 flex flex-col")}>
            {/* Header */}
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 flex-shrink-0">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 lg:gap-4 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Konkurs Główny</h1>
                        <span className="text-base lg:text-lg text-muted-foreground">
                            {gameData.header.hill.name} HS{gameData.header.hill.hs}
                        </span>
                    </div>
                    <p className="text-xs lg:text-sm text-muted-foreground max-w-2xl">
                        Ostateczna rozgrywka! Obserwuj wyniki swoich zawodników i trzymaj kciuki za jak najlepsze skoki.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => setScoringDialogOpen(true)}>
                        <Info className="w-4 h-4 mr-2" /> Jak liczone są punkty?
                    </Button>
                    {gameData.status !== 'MainCompetition' && gameData.nextStatus ? (
                        <SimplePhaseTimer
                            label={gameData.nextStatus.status === 'Ended' ? "Wyniki za" : "Wyniki za"}
                            timeSpan={gameData.nextStatus.in}
                        />
                    ) : (
                        <div className="bg-green-600 text-white px-3 lg:px-4 py-2 rounded-full flex items-center gap-2">
                            <span className="text-xl lg:text-2xl font-bold">{jumpersRemainingInSession}</span>
                            <span className="text-xs lg:text-sm">skoczków do końca</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-y-auto lg:overflow-hidden">
                {/* Left Sidebar - Start List & Players */}
                <div className="lg:w-1/4 space-y-4 lg:space-y-6 flex flex-col h-full">
                    <StartList
                        entries={competition?.startlist ?? []}
                        jumperInfos={gameData.header.competitionJumpers}
                        nextJumperId={nextJumperId}
                        isCompleted={(entry) => entry.done || false}
                        myPicks={myPicks}
                        isCompetitionEnded={isCompetitionEnded}
                        lastJumpId={gameData.lastCompetitionResultDto?.competitionJumperId}
                    />

                    <Card className="p-3 lg:p-4 flex flex-col" style={{ height: '40%', maxHeight: '40vh' }}>
                        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex-shrink-0">Gracze</h3>
                        <div className="space-y-1 lg:space-y-2 flex-1 overflow-y-auto custom-scrollbar">
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
                        <div className="overflow-y-auto lg:overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                            <div className="space-y-1">
                                {(() => {
                                    const results = competition?.results || [];
                                    if (results.length === 0) return null;

                                    const maxRounds = Math.max(1, ...results.map(r => r.rounds.length));

                                    return (
                                        <>
                                            {/* Header */}
                                            <div className="flex items-center gap-4 p-3 rounded-lg text-xs text-muted-foreground font-semibold sticky top-0 bg-card z-10">
                                                <span className="w-8 text-center">#</span>
                                                <div className="w-6 h-4"></div> {/* Flag space */}
                                                <div className="flex-1">Skoczek</div>
                                                {Array.from({ length: maxRounds }).map((_, i) => (
                                                    <div key={`header-round-${i}`} className="text-right w-24">Seria {i + 1}</div>
                                                ))}
                                                <div className="text-right font-bold w-24">Suma</div>
                                            </div>

                                            {results
                                                .sort((a, b) => a.rank - b.rank)
                                                .map((result) => {
                                                    const jumper = gameData.header.competitionJumpers?.find(
                                                        cj => cj.competitionJumperId === result.competitionJumperId
                                                    );

                                                    const isMyJumper = myPicks.includes(jumper?.gameJumperId ?? '');
                                                    const isOthersJumper = otherPicks.includes(jumper?.gameJumperId ?? '');
                                                    const hasLessJumps = competition?.roundIndex != null && result.rounds.length < competition.roundIndex + 1;
                                                    const isLastAdded = result.competitionJumperId === lastHighlightedJumper;

                                                    return (
                                                        <div
                                                            key={result.competitionJumperId}
                                                            className={`${isLastAdded ? 'bg-blue-500/15 border border-blue-500/40 animate-card-reveal' : 'hover:bg-muted/50 transition-colors duration-200'
                                                                }`}
                                                        >
                                                            {result.rounds.length > 0 ? (
                                                                <JumpResultTooltip
                                                                    round={result.rounds[result.rounds.length - 1]}
                                                                    startingGate={competition?.gateState?.starting}
                                                                    jumperInfo={jumper ? { name: jumper.name, surname: jumper.surname, countryFisCode: jumper.countryFisCode, bib: result.bib } : undefined}
                                                                    className="block"
                                                                >
                                                                    <div className={cn(`flex items-center gap-4 p-3 rounded-lg`,
                                                                        isMyJumper && 'bg-purple-600/20',
                                                                        isOthersJumper && 'bg-yellow-100/10',
                                                                        hasLessJumps && 'opacity-60'
                                                                    )}>
                                                                        <span className="text-sm font-mono text-muted-foreground w-8 text-center">{result.rank}</span>
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

                                                                        {/* Rounds */}
                                                                        {Array.from({ length: maxRounds }).map((_, i) => (
                                                                            <div key={`result-${i}`} className="text-right w-24">
                                                                                {result.rounds[i] ? (
                                                                                    <JumpResultTooltip
                                                                                        round={result.rounds[i]}
                                                                                        startingGate={competition?.gateState?.starting}
                                                                                        jumperInfo={jumper ? { name: jumper.name, surname: jumper.surname, countryFisCode: jumper.countryFisCode, bib: result.bib } : undefined}
                                                                                        roundIndex={i}
                                                                                        className="block"
                                                                                    >
                                                                                        <div className="text-right">
                                                                                            <div className="text-sm font-mono text-foreground">
                                                                                                {result.rounds[i].distance.toFixed(1)}m
                                                                                            </div>
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                {result.rounds[i].points.toFixed(1)}p
                                                                                            </div>
                                                                                        </div>
                                                                                    </JumpResultTooltip>
                                                                                ) : (
                                                                                    <div className="text-xs text-muted-foreground">-</div>
                                                                                )}
                                                                            </div>
                                                                        ))}

                                                                        {/* Total points sum */}
                                                                        <div className="text-right font-semibold text-lg w-24">
                                                                            {result.total.toFixed(1)}
                                                                        </div>
                                                                    </div>
                                                                </JumpResultTooltip>
                                                            ) : (
                                                                <div className={cn(`flex items-center gap-4 p-3 rounded-lg`,
                                                                    isMyJumper && 'bg-purple-600/20',
                                                                    isOthersJumper && 'bg-yellow-100/10',
                                                                    hasLessJumps && 'opacity-60'
                                                                )}>
                                                                    <span className="text-sm font-mono text-muted-foreground w-8 text-center">{result.rank}</span>
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
                                                                    {/* Rounds */}
                                                                    {Array.from({ length: maxRounds }).map((_, i) => (
                                                                        <div key={`result-${i}`} className="text-right w-24">
                                                                            <div className="text-xs text-muted-foreground">-</div>
                                                                        </div>
                                                                    ))}
                                                                    {/* Total points sum */}
                                                                    <div className="text-right font-semibold text-lg w-24">
                                                                        {result.total.toFixed(1)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Sidebar - Countdown & Jumper Details */}
                <div className="lg:w-1/4 space-y-4 lg:space-y-6 flex flex-col">
                    <Card className={`p-3 lg:p-4 flex-shrink-0 ${isCompetitionEnded ? 'opacity-50' : ''}`}>
                        <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex items-center gap-2">
                            <span>Następny skok:</span>
                            {nextJumperDisplay && !isCompetitionEnded && (
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
                            {isCompetitionEnded && <span className="text-muted-foreground">Konkurs zakończony</span>}
                        </h3>
                        {!isCompetitionEnded && (
                            <div className="relative bg-muted rounded-lg overflow-hidden">
                                <div
                                    key={`progress-${gameData?.lastCompetitionResultDto?.competitionJumperId || 'initial'}`}
                                    className={cn("h-8 rounded-lg",
                                        myPicks.includes(nextJumperInfo?.gameJumperId ?? '')
                                            ? "bg-gradient-to-r from-purple-600 to-purple-500"
                                            : "bg-gradient-to-r from-blue-600 to-blue-500"
                                    )}
                                    style={{ width: `${initialCountdown > 0 ? ((initialCountdown - countdown) / initialCountdown) * 100 : 0}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {countdown > 0 ? (
                                        <span className="text-sm font-bold text-white drop-shadow-lg">
                                            {Math.round(countdown)}s
                                        </span>
                                    ) : (
                                        <AnimatedJumpingText />
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>

                    {lastJumpResult && lastJumperDetails && (
                        <div className={`relative`}>
                            <Card key={lastJumpResult.competitionJumperId + String(lastJumpResult.points)} className={cn(
                                "p-3 lg:p-4 flex-shrink-0 animate-card-reveal reveal-shader-top",
                                myPicks.includes(lastJumperDetails.gameJumperId) && "bg-purple-600/20 border-2 border-purple-500/50 shadow-lg shadow-purple-500/25"
                            )}>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={getCountryFlag(lastJumperDetails.countryFisCode)}
                                                    alt={lastJumperDetails.countryFisCode}
                                                    className="w-6 h-4 object-cover rounded"
                                                />
                                                <h4 className="font-semibold text-lg text-foreground">
                                                    {lastJumperDetails.name} {lastJumperDetails.surname}
                                                </h4>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 bg-muted/30 p-4 rounded-lg">
                                        <div className="flex justify-center gap-8">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-foreground">
                                                    {lastJumpResult.distance.toFixed(1)}m
                                                </div>
                                                <div className="text-sm text-muted-foreground">Odległość</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-foreground">
                                                    {lastJumperRank}
                                                </div>
                                                <div className="text-sm text-muted-foreground">miejsce</div>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/50"></div>

                                        {/* Wind and Gate Info */}
                                        <div className="grid grid-cols-2 gap-4 text-center text-sm">
                                            <div>
                                                <div className="text-base font-medium text-foreground">
                                                    {lastJumpResult.windAverage.toFixed(2)} m/s
                                                </div>
                                                <div className="text-xs text-muted-foreground">Średni wiatr</div>
                                            </div>
                                            <div>
                                                <div className="text-base font-medium text-foreground">
                                                    {lastJumpResult.gate}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Belka</div>
                                            </div>
                                        </div>

                                        <div className="border-t border-border/50"></div>

                                        {lastJumpResult.judges && (
                                            <div>
                                                <div className="grid grid-cols-5 gap-1 text-center mb-2">
                                                    {lastJumpResult.judges.slice(0, 5).map((score: number, index: number) => (
                                                        <div key={index} className="text-sm font-mono">
                                                            {score.toFixed(1)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-muted-foreground text-center">
                                                    Noty sędziowskie ({lastJumpResult.judgePoints?.toFixed(1)}p)
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                            <div>
                                                <div className={cn(`text-base font-medium`, lastJumpResult.gateCompensation != null && lastJumpResult.gateCompensation > 0 ? 'text-green-400' : 'text-red-400')}>
                                                    {lastJumpResult.gateCompensation != null && lastJumpResult.gateCompensation >= 0 ? '+' : ''}{lastJumpResult.gateCompensation?.toFixed(1)}p
                                                </div>
                                                <div className="text-xs text-muted-foreground">za belkę</div>
                                            </div>
                                            <div>
                                                <div className={cn(`text-2xl font-bold`, lastJumpResult.totalCompensation > 0 ? 'text-green-500' : 'text-red-500')}>
                                                    {lastJumpResult.totalCompensation >= 0 ? '+' : ''}{lastJumpResult.totalCompensation?.toFixed(1)}p
                                                </div>
                                                <div className="text-xs text-muted-foreground">łącznie</div>
                                            </div>
                                            <div>
                                                <div className={cn(`text-base font-medium`, lastJumpResult.windCompensation != null && lastJumpResult.windCompensation > 0 ? 'text-green-400' : 'text-red-400')}>
                                                    {lastJumpResult.windCompensation != null && lastJumpResult.windCompensation >= 0 ? '+' : ''}{lastJumpResult.windCompensation?.toFixed(1)}p
                                                </div>
                                                <div className="text-xs text-muted-foreground">za wiatr</div>
                                            </div>
                                        </div>
                                        <div className="text-center pt-2 border-t border-border">
                                            <div className="text-lg font-bold text-foreground">
                                                {lastJumpResult.points.toFixed(1)} punktów
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    {onBack && <Button onClick={onBack} className="mt-4">Back to Menu</Button>}
                </div>
            </div>

            <Dialog open={scoringDialogOpen} onOpenChange={setScoringDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Jak liczone są punkty?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-300">Gracze zdobywają punkty za miejsca swoich zawodników w konkursie.</p>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                            <pre className="whitespace-pre-wrap text-sm leading-6">{policyLines.join("\n")}</pre>
                        </div>
                        <p className="text-sm text-neutral-400">{policySummary}</p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
