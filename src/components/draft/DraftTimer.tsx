'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';

interface DraftTimerProps {
    timeoutInSeconds: number;
    currentPlayerId?: string | null; // Used to reset timer when player changes
    myPlayerId?: string; // To determine if it's my turn
    paused?: boolean; // When true, do not start countdown
}

export const DraftTimer = ({ timeoutInSeconds, currentPlayerId, myPlayerId, paused = false }: DraftTimerProps) => {
    const [remaining, setRemaining] = useState(timeoutInSeconds);

    useEffect(() => {
        setRemaining(timeoutInSeconds);
        if (paused) return; // do not start countdown when paused
        const interval = setInterval(() => {
            setRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeoutInSeconds, currentPlayerId, paused]); // Reset when player changes

    const percentage = (remaining / Math.max(timeoutInSeconds, 1)) * 100;
    const isMyTurn = currentPlayerId === myPlayerId;
    const isUrgent = remaining <= 5 && isMyTurn;

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card className={`p-4 bg-neutral-800 border-neutral-700 text-white transition-all duration-300 ${paused ? 'opacity-60' : ''} ${isUrgent ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">Czas na wybór</h4>
                <Clock className={`w-6 h-6 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
            </div>
            <div className="text-center">
                <p className={`text-5xl font-bold font-mono transition-colors duration-300 ${isUrgent ? 'text-red-500 animate-pulse' : isMyTurn ? 'text-yellow-400' : 'text-white'}`}>
                    {formatTime(remaining)}
                </p>
                <p className="text-sm text-gray-400">sekund</p>
            </div>
            <Progress
                value={percentage}
                className={`mt-4 h-3 [&>*]:bg-gradient-to-r ${isUrgent ? '[&>*]:!from-yellow-500 [&>*]:!to-red-500' : '[&>*]:from-blue-500 [&>*]:to-purple-500'}`}
            />
        </Card>
    );
};
