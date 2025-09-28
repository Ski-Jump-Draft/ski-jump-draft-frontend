'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EndedCompetitionResults, CompetitionJumperDto } from '@/types/game';
import { fisToAlpha2 } from '@/utils/countryCodes';
import { Check } from 'lucide-react';
import { JumpResultTooltip } from '@/components/ui/JumpResultTooltip';

interface CompetitionResultsTableProps {
    endedCompetitions: EndedCompetitionResults[];
    competitionJumpers: CompetitionJumperDto[];
    draftedJumperIds: string[];
    onJumperSelect: (jumperId: string) => void;
    onJumperPick: (jumperId: string) => void;
    selectedJumperId: string | null;
    myPlayerId?: string; // To determine which picks are ours
    draftPicks?: { playerId: string; jumperIds: string[] }[]; // All draft picks to show colors
    isMyTurn?: boolean; // Whether it's my turn to pick
    startingGate?: number; // Starting gate for tooltip comparison
}

export const CompetitionResultsTable = ({
    endedCompetitions,
    competitionJumpers,
    draftedJumperIds,
    onJumperSelect,
    onJumperPick,
    selectedJumperId,
    myPlayerId,
    draftPicks = [],
    isMyTurn = false,
    startingGate
}: CompetitionResultsTableProps) => {
    const [activeSession, setActiveSession] = useState(0);

    const competitionResults = endedCompetitions[activeSession]?.results || [];


    const getJumperDetails = (competitionJumperId: string) => {
        return competitionJumpers.find(j => j.competitionJumperId === competitionJumperId);
    };

    return (
        <Card className="bg-neutral-800 border-neutral-700 text-white h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-700 flex-shrink-0">
                <h3 className="text-xl font-bold">Wyniki Treningu</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {endedCompetitions.map((_, index) => (
                        <Button
                            key={index}
                            variant={activeSession === index ? 'secondary' : 'outline'}
                            className={`px-4 py-2 rounded-md text-sm ${activeSession === index
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-neutral-700 hover:bg-neutral-600 border-neutral-600'
                                }`}
                            onClick={() => setActiveSession(index)}
                        >
                            Sesja {index + 1}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 px-4 py-2 font-semibold text-sm text-gray-400 border-b border-neutral-700 sticky top-0 bg-neutral-800">
                    <div className="text-right">#</div>
                    <div>Skoczek</div>
                    <div className="text-right">Odległość</div>
                    <div className="text-right">Punkty</div>
                </div>
                <div>
                    {competitionResults.length > 0 ? (
                        competitionResults.map((result) => {
                            const jumper = getJumperDetails(result.competitionJumperId);
                            const isDrafted = draftedJumperIds.includes(jumper?.gameJumperId || '');
                            const isSelected = selectedJumperId === jumper?.gameJumperId;

                            // Check if this jumper was picked by us or others
                            const myPick = draftPicks.find(pick => pick.playerId === myPlayerId)?.jumperIds.includes(jumper?.gameJumperId || '') || false;
                            const othersPick = draftPicks.some(pick => pick.playerId !== myPlayerId && pick.jumperIds.includes(jumper?.gameJumperId || '')) || false;

                            // Disable interactions if not my turn or jumper is drafted
                            const canInteract = isMyTurn && !isDrafted;

                            const lastRound = result.rounds[result.rounds.length - 1];

                            return (
                                <div key={result.competitionJumperId}>
                                    {lastRound ? (
                                        <JumpResultTooltip
                                            round={lastRound}
                                            startingGate={startingGate}
                                            jumperInfo={jumper ? { name: jumper.name, surname: jumper.surname, countryFisCode: jumper.countryFisCode } : undefined}
                                            className="block"
                                        >
                                            <div
                                                className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 px-4 py-3 border-b border-neutral-700/50 transition-all duration-300
                                                    ${myPick ? 'bg-purple-600/20' :
                                                        othersPick ? 'bg-yellow-100/20' :
                                                            isDrafted ? 'bg-gray-600/20' : ''}
                                                    ${canInteract ? 'cursor-pointer hover:bg-neutral-700/50' : 'cursor-not-allowed'}
                                                    ${isSelected ? 'bg-purple-600/30 ring-2 ring-purple-500' : ''}
                                                `}
                                                onClick={() => canInteract && onJumperSelect(jumper?.gameJumperId || '')}
                                                onDoubleClick={() => canInteract && onJumperPick(jumper?.gameJumperId || '')}
                                            >
                                                <div className="text-right font-mono text-gray-300">{result.rank}</div>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={`/flags/${fisToAlpha2(jumper?.countryFisCode || '') || 'xx'}.svg`}
                                                        alt={jumper?.countryFisCode}
                                                        className="w-6 h-4 rounded-sm object-cover"
                                                    />
                                                    <span className="font-medium">{jumper ? `${jumper.name} ${jumper.surname}` : 'Unknown Jumper'}</span>
                                                    {isDrafted && (
                                                        <Check className="w-4 h-4 text-purple-400 ml-auto" />
                                                    )}
                                                </div>
                                                <div className="text-right font-mono text-gray-300">{lastRound.distance.toFixed(1)}m</div>
                                                <div className="text-right font-semibold text-lg">{result.total.toFixed(1)}</div>
                                            </div>
                                        </JumpResultTooltip>
                                    ) : (
                                        <div
                                            className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-6 px-4 py-3 border-b border-neutral-700/50 transition-all duration-300
                                                ${myPick ? 'bg-purple-600/20' :
                                                    othersPick ? 'bg-yellow-100/20' :
                                                        isDrafted ? 'bg-gray-600/20' : ''}
                                                ${canInteract ? 'cursor-pointer hover:bg-neutral-700/50' : 'cursor-not-allowed'}
                                                ${isSelected ? 'bg-purple-600/30 ring-2 ring-purple-500' : ''}
                                            `}
                                            onClick={() => canInteract && onJumperSelect(jumper?.gameJumperId || '')}
                                            onDoubleClick={() => canInteract && onJumperPick(jumper?.gameJumperId || '')}
                                        >
                                            <div className="text-right font-mono text-gray-300">{result.rank}</div>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`/flags/${fisToAlpha2(jumper?.countryFisCode || '') || 'xx'}.svg`}
                                                    alt={jumper?.countryFisCode}
                                                    className="w-6 h-4 rounded-sm object-cover"
                                                />
                                                <span className="font-medium">{jumper ? `${jumper.name} ${jumper.surname}` : 'Unknown Jumper'}</span>
                                                {isDrafted && (
                                                    <Check className="w-4 h-4 text-purple-400 ml-auto" />
                                                )}
                                            </div>
                                            <div className="text-right font-mono text-gray-500">—</div>
                                            <div className="text-right font-semibold text-lg">{result.total.toFixed(1)}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-8 text-center text-gray-400">
                            <p>Brak wyników treningu</p>
                            <p className="text-sm mt-2">Wyniki pojawią się po zakończeniu treningu</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
