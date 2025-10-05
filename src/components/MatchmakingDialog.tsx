'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Bot, User, Clock, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

function useDots(interval = 400) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const values = ['', '.', '..', '...'];
        let i = 0;

        const id = setInterval(() => {
            i = (i + 1) % values.length;
            setDots(values[i]);
        }, interval);

        return () => clearInterval(id);
    }, [interval]);

    return dots;
}

export interface MatchmakingPlayerVm {
    playerId: string;
    nick: string;
    isBot: boolean;
    joinedAt: string;
}

export interface MatchmakingDialogProps {
    open: boolean;
    current: number;
    max: number;
    min?: number;
    status: 'waiting' | 'starting' | 'failed';
    reason?: string;
    onCancel: () => void;
    busy?: boolean;
    forceEndAt?: string | null;
    shouldEndAcceleratedAt?: string | null;
    endAfterNoUpdate?: boolean;
    players?: MatchmakingPlayerVm[];
    recentJoins?: MatchmakingPlayerVm[];
    recentLeaves?: MatchmakingPlayerVm[];
}
export function MatchmakingDialog({
    open,
    current,
    max,
    min,
    status,
    reason,
    onCancel,
    busy = false,
    forceEndAt,
    shouldEndAcceleratedAt,
    endAfterNoUpdate = false,
    players = [],
    recentJoins = [],
    recentLeaves = [],
}: MatchmakingDialogProps) {
    const percentPlayers = max != null && max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const dots = useDots();

    // Countdown logic - use shouldEndAcceleratedAt if available and endAfterNoUpdate is false, otherwise use forceEndAt
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    useEffect(() => {
        // Determine which time to use for countdown
        const targetTime = (!endAfterNoUpdate && shouldEndAcceleratedAt) ? shouldEndAcceleratedAt : forceEndAt;

        if (!targetTime) { setSecondsLeft(null); return; }
        const target = new Date(targetTime).getTime();
        const tick = () => setSecondsLeft(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [forceEndAt, shouldEndAcceleratedAt, endAfterNoUpdate]);

    const urgent = secondsLeft !== null && secondsLeft <= 10;

    // Calculate time to shouldEndAcceleratedAt for endAfterNoUpdate logic
    const timeToAccelerated = shouldEndAcceleratedAt
        ? Math.max(0, Math.ceil((new Date(shouldEndAcceleratedAt).getTime() - Date.now()) / 1000))
        : null;

    const title = status === 'failed'
        ? ''
        : status === 'starting'
            ? 'Rozpoczynanie gry…'
            : endAfterNoUpdate
                ? (timeToAccelerated !== null && timeToAccelerated <= 3)
                    ? 'Zdaje się, że możemy zaczynać…'
                    : 'Czekamy na graczy…'
                : `Trwa dobieranie graczy${dots}`;

    const sortedPlayers = useMemo(() => {
        // Sort by join time (earliest first)
        return [...players].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    }, [players]);

    // Track newly joined players for highlight effect based on joinedAt
    const [newlyJoined, setNewlyJoined] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (players.length > 0) {
            const now = Date.now();
            const highlightDuration = 3000; // 3 seconds

            // Check each player if they should be highlighted
            const playersToHighlight = new Set<string>();
            const playersToRemove = new Set<string>();

            players.forEach(player => {
                const joinTime = new Date(player.joinedAt).getTime();
                const timeSinceJoin = now - joinTime;

                if (timeSinceJoin < highlightDuration) {
                    playersToHighlight.add(player.playerId);
                } else {
                    playersToRemove.add(player.playerId);
                }
            });

            setNewlyJoined(prev => {
                const updated = new Set(prev);

                // Add new players to highlight
                playersToHighlight.forEach(id => updated.add(id));

                // Remove players that should no longer be highlighted
                playersToRemove.forEach(id => updated.delete(id));

                return updated;
            });
        }
    }, [players]);

    // Cleanup timer for players that should stop being highlighted
    useEffect(() => {
        if (newlyJoined.size === 0) return;

        const now = Date.now();
        const highlightDuration = 3000;

        const timers: NodeJS.Timeout[] = [];

        players.forEach(player => {
            if (newlyJoined.has(player.playerId)) {
                const joinTime = new Date(player.joinedAt).getTime();
                const timeSinceJoin = now - joinTime;
                const remainingTime = highlightDuration - timeSinceJoin;

                if (remainingTime > 0) {
                    const timer = setTimeout(() => {
                        setNewlyJoined(prev => {
                            const updated = new Set(prev);
                            updated.delete(player.playerId);
                            return updated;
                        });
                    }, remainingTime);

                    timers.push(timer);
                }
            }
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, [newlyJoined, players]);

    return (
        <Dialog open={open}>
            <DialogContent
                className="sm:max-w-4xl max-h-[95vh] overflow-y-auto"
                showCloseButton={false}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                {title && (
                    <DialogHeader className="pb-4">
                        <DialogTitle className="font-display text-center text-2xl">
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                )}

                {status === 'failed' ? (
                    <div className="space-y-6 py-6">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <p className="text-lg text-red-500 mb-2">Matchmaking nie powiódł się</p>
                            <p className="text-sm text-muted-foreground">{reason || "Spróbuj ponownie za chwilę."}</p>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={busy}
                                className="w-32 cursor-pointer transition active:scale-95"
                            >
                                Zamknij
                                {busy && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header with stats */}
                        <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    <span className="text-lg font-semibold">{current}</span>
                                    <span className="text-muted-foreground">/ {max}</span>
                                </div>
                                {min && (
                                    <div className="text-sm text-muted-foreground">
                                        min. {min}
                                    </div>
                                )}
                            </div>

                            {/* Timer / Status hint */}
                            {status !== 'starting' && (
                                endAfterNoUpdate ? (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-500/40 bg-blue-500/10">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-400">
                                            Czekamy na graczy
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Clock className={cn("w-4 h-4", urgent ? 'text-red-400' : 'text-yellow-400')} />
                                        <span className={cn("text-lg font-bold", urgent ? 'text-red-400' : 'text-yellow-300')}>
                                            {secondsLeft != null ? `${secondsLeft}s` : '—'}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>



                        {/* Players list - main content */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Lista graczy ({sortedPlayers.length})
                                </h3>
                            </div>

                            {sortedPlayers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                    {sortedPlayers.map((player, index) => {
                                        const isNewlyJoined = newlyJoined.has(player.playerId);
                                        return (
                                            <div
                                                key={player.playerId}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-500 border",
                                                    isNewlyJoined
                                                        ? "bg-green-500/10 border-green-500/30 shadow-sm shadow-green-500/10"
                                                        : "bg-muted/30 hover:bg-muted/50 border-border/40"
                                                )}
                                            >
                                                <div className="flex-shrink-0">
                                                    {Boolean(player.isBot) ? (
                                                        <Bot className="w-4 h-4 text-blue-400" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-green-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className={cn(
                                                        "text-sm font-medium truncate transition-colors duration-500",
                                                        isNewlyJoined ? "text-green-600 dark:text-green-400" : "text-foreground"
                                                    )}>
                                                        {player.nick}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">Brak graczy w lobby</p>
                                </div>
                            )}
                        </div>

                        {/* Starting effect */}
                        {status === 'starting' && (
                            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-blue-600/30 border border-blue-500/30">
                                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10" />
                                <div className="relative flex items-center justify-center gap-3 py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-300" />
                                    <span className="text-lg font-semibold text-blue-100">Rozpoczynanie gry…</span>
                                </div>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex justify-center pt-4 border-t border-border/50">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                disabled={busy || status === 'starting'}
                                className="w-40 cursor-pointer transition active:scale-95"
                            >
                                Przerwij
                                {busy && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
