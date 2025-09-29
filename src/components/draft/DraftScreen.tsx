'use client';

import { useState, useEffect } from 'react';
import { GameUpdatedDto } from '@/types/game';
import { CompetitionResultsTable } from './CompetitionResultsTable';
import { DraftTimer } from './DraftTimer';
import { DraftOrder } from './DraftOrder';
import { DraftPicks } from './DraftPicks';
import { pickJumper } from '@/lib/gameApi';
import { AnimatePresence, motion } from 'framer-motion';
import { DraftOrderEmptyState } from './DraftOrderEmptyState';
import { SimplePhaseTimer } from '../ui/SimplePhaseTimer';

interface DraftScreenProps {
    gameData: GameUpdatedDto;
    myPlayerId: string;
    isReadOnly?: boolean; // For pre-draft break period
}

export const DraftScreen = ({ gameData, myPlayerId, isReadOnly = false }: DraftScreenProps) => {
    const [selectedJumperId, setSelectedJumperId] = useState<string | null>(null);
    const [showPickAnimation, setShowPickAnimation] = useState<string | null>(null);

    const { header, preDraft, endedPreDraft, draft } = gameData;
    const draftedJumperIds = draft?.picks.flatMap(p => p.jumperIds) || [];
    const totalPicksDone = draft ? draft.picks.reduce((acc, p) => acc + p.jumperIds.length, 0) : 0;
    const isDraftEnded = !!draft?.ended;

    // Clear selection when it's not my turn anymore
    useEffect(() => {
        if (draft?.currentPlayerId !== myPlayerId) {
            setSelectedJumperId(null);
        }
    }, [draft?.currentPlayerId, myPlayerId]);


    const handleJumperSelect = (jumperId: string) => {
        if (!isReadOnly) {
            setSelectedJumperId(jumperId);
        }
    };

    const handleJumperPick = async (jumperId: string) => {
        if (isReadOnly) {
            console.log("Pick blocked: read-only mode");
            return; // No picking allowed in read-only mode
        }


        if (!draft?.currentPlayerId || draft.currentPlayerId !== myPlayerId) {
            return;
        }

        setShowPickAnimation(jumperId);
        const result = await pickJumper(gameData.gameId, myPlayerId, jumperId);
        console.log("Pick result:", result);

        if (result.success) {
            setSelectedJumperId(null); // Clear selection immediately
        }

        setTimeout(() => {
            setShowPickAnimation(null);
        }, 400); // Animation duration - shortened by half
    };

    // Always show DraftScreen - if no draft data, show pre-draft results
    // In read-only mode (Break Draft), we need either endedPreDraft OR draft data
    // In normal mode, we need draft data
    if (isReadOnly) {
        if (!endedPreDraft && !draft) {
            return <div className="text-white">Oczekiwanie na dane draftu...</div>;
        }
    } else {
        if (!draft) {
            return <div className="text-white">Oczekiwanie na dane draftu...</div>;
        }
    }

    // Use endedPreDraft first, then fallback to current preDraft or lastCompetitionState
    const preDraftCompetitions = endedPreDraft?.endedCompetitions ||
        (preDraft?.competition?.results ? [{ results: preDraft.competition.results }] :
            (gameData.lastCompetitionState ? [{ results: gameData.lastCompetitionState.results }] : []));

    const orderPolicy = draft?.orderPolicy || gameData.header.draftOrderPolicy;

    // Debug log for timer data
    if (isReadOnly && gameData.nextStatus) {
        console.log('DraftScreen: nextStatus =', gameData.nextStatus, 'in =', gameData.nextStatus.in);
    }

    return (
        <div className="fixed inset-0 bg-neutral-900 text-white p-4 lg:p-6 flex flex-col gap-6 min-h-0 overflow-hidden">
            <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 flex-shrink-0">
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 lg:gap-4 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold text-white">Draft</h1>
                    </div>
                    {isReadOnly ? (
                        <p className="text-xs lg:text-sm text-gray-400 max-w-2xl">
                            Wyniki treningu - Draft rozpocznie się za chwilę
                        </p>
                    ) : (
                        <p className="text-xs lg:text-sm text-gray-400 max-w-3xl">
                            Wybierz skoczków do swojej drużyny. Masz {draft?.timeoutInSeconds || "BŁĄD"} sekund na wybór. Kto zapewni ci zwycięstwo w konkursie głównym?
                        </p>
                    )}
                </div>
                {isReadOnly && gameData.nextStatus && (
                    <div className="flex items-center">
                        <SimplePhaseTimer
                            label="Draft"
                            timeSpan={gameData.nextStatus.in}
                            subtractSeconds={5}
                        />
                    </div>
                )}
                {/* Show break-to-main-competition timer after draft ended */}
                {!isReadOnly && isDraftEnded && gameData.nextStatus?.status === 'MainCompetition' && (
                    <div className="flex items-center">
                        <SimplePhaseTimer
                            label="Konkurs"
                            timeSpan={gameData.nextStatus.in}
                            subtractSeconds={0}
                        />
                    </div>
                )}
            </div>

            <main className="flex-1 flex flex-col xl:flex-row gap-4 min-h-0 overflow-hidden">
                {/* Left Column - Results Table */}
                <div className="flex-[3] min-h-0">
                    <CompetitionResultsTable
                        endedCompetitions={preDraftCompetitions}
                        competitionJumpers={header.competitionJumpers}
                        draftedJumperIds={isReadOnly ? [] : draftedJumperIds}
                        onJumperSelect={handleJumperSelect}
                        onJumperPick={handleJumperPick}
                        selectedJumperId={isReadOnly ? null : selectedJumperId}
                        myPlayerId={myPlayerId}
                        draftPicks={draft?.picks || []}
                        isMyTurn={!isReadOnly && draft?.currentPlayerId === myPlayerId}
                        startingGate={gameData.preDraft?.competition?.gateState?.starting || gameData.lastCompetitionState?.gateState?.starting}
                    />
                </div>

                {/* Right Column - Draft Controls */}
                <aside className="flex-[2] flex flex-col gap-4 min-h-0">
                    <div className="flex flex-col xl:flex-row gap-4">
                        <div className="flex-1">
                            {draft ? (
                                <DraftTimer
                                    key={`${draft.currentPlayerId ?? 'none'}-${totalPicksDone}`}
                                    timeoutInSeconds={draft.timeoutInSeconds ?? (header.draftTimeoutInSeconds ?? 30)}
                                    currentPlayerId={draft.currentPlayerId}
                                    myPlayerId={myPlayerId}
                                    paused={isDraftEnded}
                                />
                            ) : (
                                <DraftTimer
                                    timeoutInSeconds={header.draftTimeoutInSeconds ?? 30}
                                    currentPlayerId={null}
                                    myPlayerId={myPlayerId}
                                    paused={true}
                                />
                            )}
                        </div>
                        <div className="flex-1">
                            {draft ? (
                                <div className={isDraftEnded ? 'opacity-60' : ''}>
                                    <DraftOrder
                                        players={header.players}
                                        nextPlayers={draft.nextPlayers}
                                        currentPlayerId={draft.currentPlayerId}
                                        orderPolicy={orderPolicy}
                                        myPlayerId={myPlayerId}
                                    />
                                    {isDraftEnded && (
                                        <div className="mt-1 text-xs text-gray-400">Draft zakończony</div>
                                    )}
                                </div>
                            ) : (
                                <DraftOrderEmptyState
                                    orderPolicy={orderPolicy}
                                    timeoutInSeconds={header.draftTimeoutInSeconds}
                                />
                            )}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <DraftPicks
                            players={header.players}
                            picks={draft?.picks ?? []}
                            jumpers={header.jumpers}
                            currentPlayerId={draft?.currentPlayerId}
                            myPlayerId={myPlayerId}
                            isBreak={!draft}
                        />
                    </div>
                </aside>
            </main>

            <AnimatePresence>
                {showPickAnimation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7, y: -50 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <div className="bg-gradient-to-br from-purple-600 to-blue-700 p-8 rounded-2xl shadow-2xl text-center">
                            <h2 className="text-3xl font-bold">Wybrano!</h2>
                            {/* <p className="text-lg">Dodano do drużyny.</p> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
