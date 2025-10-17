'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { fisToAlpha2 } from '@/utils/countryCodes';
import { cn } from '@/lib/utils';

export interface StartListEntry {
    // Common fields
    bib: number;

    // For PreDraft (direct data)
    jumperId?: string;
    countryFisCode?: string;
    name?: string;
    surname?: string;

    // For MainCompetition (reference data)
    competitionJumperId?: string;
    done?: boolean;
}

export interface JumperInfo {
    competitionJumperId: string;
    gameJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

export interface StartListProps {
    entries: StartListEntry[];
    jumperInfos?: JumperInfo[]; // For MainCompetition mode
    nextJumperId?: string | null;
    isCompleted?: (entry: StartListEntry) => boolean; // Custom completion check
    myPicks?: string[]; // For MainCompetition mode
    isCompetitionEnded?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onScroll?: () => void;
    autoScroll?: boolean;
    lastJumpId?: string | null; // For auto-scroll trigger
}

export function StartList({
    entries,
    jumperInfos = [],
    nextJumperId,
    isCompleted,
    myPicks = [],
    isCompetitionEnded = false,
    className,
    style,
    onScroll,
    autoScroll = true,
    lastJumpId
}: StartListProps) {
    const startlistRef = useRef<HTMLDivElement>(null);
    const [userScrolled, setUserScrolled] = useState(false);

    const getCountryFlag = (countryCode: string) => {
        const alpha2Code = fisToAlpha2(countryCode) || 'xx';
        return `/flags/${alpha2Code}.svg`;
    };

    // Auto-scroll logic - scroll to current position ONLY after jump
    useEffect(() => {
        if (!startlistRef.current || !entries || !autoScroll || !lastJumpId) return;

        // Find the LAST completed entry index (not the first!)
        let lastCompletedIndex = -1;
        for (let i = entries.length - 1; i >= 0; i--) {
            const entry = entries[i];
            const completed = isCompleted ? isCompleted(entry) : (entry.done || false);
            if (completed) {
                lastCompletedIndex = i;
                break;
            }
        }

        if (lastCompletedIndex === -1) return;

        // Scroll to show the last completed entry in a good position
        const targetElement = startlistRef.current.children[lastCompletedIndex] as HTMLElement;
        if (targetElement) {
            const container = startlistRef.current;
            const elementTop = targetElement.offsetTop;
            const containerHeight = container.clientHeight;

            // Adaptive positioning based on screen size
            // Very small screens: 70% from top, small screens: 60% from top, large screens: 40% from top (more context)
            const isVerySmallScreen = containerHeight < 300;
            const isSmallScreen = containerHeight < 500;
            let offsetRatio = 0.4; // default for large screens - show more context above
            if (isVerySmallScreen) offsetRatio = 0.7; // 70% from top
            else if (isSmallScreen) offsetRatio = 0.6; // 60% from top
            const scrollTop = Math.max(0, elementTop - (containerHeight * offsetRatio));

            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    }, [lastJumpId]); // ONLY trigger on new jump

    // Reset user scroll flag when a new jump happens
    useEffect(() => {
        if (lastJumpId) {
            setUserScrolled(false);
        }
    }, [lastJumpId]);

    const handleScroll = () => {
        setUserScrolled(true);
        onScroll?.();
    };

    return (
        <Card
            className={cn("p-3 lg:p-4 flex flex-col lg:h-[60%] lg:max-h-[60vh]", isCompetitionEnded && 'opacity-50', className)}
            style={style}
        >
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex-shrink-0">
                Lista startowa
            </h3>
            <div
                ref={startlistRef}
                className="space-y-1 lg:space-y-2 lg:flex-1 lg:overflow-y-auto lg:min-h-0 custom-scrollbar"
                onScroll={handleScroll}
            >
                {entries.map((entry, index) => {
                    // Determine if this is the next jumper
                    const entryId = entry.jumperId || entry.competitionJumperId;
                    const isNextJumper = entryId === nextJumperId;

                    // Determine if completed
                    const completed = isCompleted ? isCompleted(entry) : (entry.done || false);

                    // Get jumper info (for MainCompetition mode)
                    const jumperInfo = jumperInfos.find(j => j.competitionJumperId === entry.competitionJumperId);

                    // Get display data
                    const displayData = jumperInfo ? {
                        name: jumperInfo.name,
                        surname: jumperInfo.surname,
                        countryFisCode: jumperInfo.countryFisCode,
                        gameJumperId: jumperInfo.gameJumperId
                    } : {
                        name: entry.name || 'Unknown',
                        surname: entry.surname || 'Jumper',
                        countryFisCode: entry.countryFisCode || 'UNK',
                        gameJumperId: entryId || ''
                    };

                    // Check if this is my jumper (MainCompetition mode)
                    const isMyJumper = myPicks.includes(displayData.gameJumperId);

                    return (
                        <div
                            key={`startlist-${entryId}`}
                            className={cn(
                                "flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 rounded-lg transition-colors",
                                isNextJumper && 'bg-slate-500/15 border border-slate-400/30',
                                completed && 'opacity-50',
                                isMyJumper && !completed && 'bg-purple-500/10',
                                !isNextJumper && !completed && 'hover:bg-muted/50'
                            )}
                        >
                            <span className={cn(
                                "text-xs lg:text-sm font-mono w-5 lg:w-6",
                                isNextJumper ? 'text-slate-300 font-semibold' : 'text-muted-foreground'
                            )}>
                                {entry.bib}
                            </span>
                            <img
                                src={getCountryFlag(displayData.countryFisCode)}
                                alt={displayData.countryFisCode}
                                className={cn(
                                    "w-5 h-3 lg:w-6 lg:h-4 object-cover rounded",
                                    completed && 'opacity-50'
                                )}
                            />
                            <span className={cn(
                                "text-xs lg:text-sm font-medium flex-1 truncate",
                                isNextJumper ? 'text-slate-300 font-semibold' : 'text-foreground'
                            )}>
                                {displayData.name} {displayData.surname}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
