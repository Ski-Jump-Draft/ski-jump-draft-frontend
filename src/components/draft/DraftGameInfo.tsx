'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, TrendingUp, ArrowRightLeft, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftGameInfoProps {
    picksPerPlayer: number;
    orderPolicy: 'Classic' | 'Snake' | 'Random';
    rankingPolicy: 'Classic' | 'PodiumAtAllCosts';
    onShowScoringDetails: () => void;
}

export const DraftGameInfo = ({ picksPerPlayer, orderPolicy, rankingPolicy, onShowScoringDetails }: DraftGameInfoProps) => {
    const orderPolicyName = orderPolicy === "Snake" ? "Snake" : orderPolicy === "Random" ? "Losowa" : "NIEZNANA";
    const rankingPolicyName = rankingPolicy === "Classic" ? "Klasyczna" : "Podium za wszelką cenę";

    return (
        <Card className="p-4 bg-neutral-800 border-neutral-700 text-white">
            <h4 className="font-semibold text-sm text-gray-400 mb-3">Zasady gry</h4>

            <div className="space-y-3">
                {/* Picks per player */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Skoczków na gracza</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: 6 }).map((_, i) => {
                            const isFilled = i < picksPerPlayer;
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-7 h-7 rounded flex items-center justify-center border transition-all",
                                        isFilled
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/30 shadow-sm"
                                            : "border-blue-400/30 bg-neutral-700/30"
                                    )}
                                    title={isFilled ? `Skoczek ${i + 1}` : `Slot ${i + 1} (pusty)`}
                                >
                                    <User className={cn("w-4 h-4", isFilled ? "text-white" : "text-blue-400/40")} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order policy */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">Kolejność</span>
                    </div>
                    <span className="font-medium text-purple-400">{orderPolicyName}</span>
                </div>

                {/* Ranking policy */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Punktacja</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onShowScoringDetails}
                        className="h-auto py-1 px-2 hover:bg-neutral-700 text-green-400 hover:text-green-300"
                    >
                        <span className="font-medium">{rankingPolicyName}</span>
                        <Info className="w-3 h-3 ml-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

