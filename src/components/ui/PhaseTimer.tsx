'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PhaseTimerProps {
    targetTime: string; // TimeSpan like "00:00:05.123"
    nextPhase: string;
    sessionNumber?: number;
    label?: string;
    subtractSeconds?: number;
}

export const PhaseTimer = ({ targetTime, nextPhase, sessionNumber, label, subtractSeconds = 0 }: PhaseTimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [isLowTime, setIsLowTime] = useState(false);

    // PhaseTimer render

    useEffect(() => {
        // Parse TimeSpan string (format: "00:00:18" or "00:01:30")
        const parseTimeSpan = (timeSpan: string): number => {
            if (!timeSpan) return 0;
            const parts = timeSpan.split(':');
            if (parts.length === 3) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const secs = parseInt(parts[2], 10);
                return hours * 3600 + minutes * 60 + secs;
            }
            return 0;
        };

        const totalSeconds = parseTimeSpan(targetTime);
        setRemainingSeconds(totalSeconds);
        setIsLowTime(totalSeconds <= 6);

        // Always start the interval, even if totalSeconds is 0

        const interval = setInterval(() => {
            setRemainingSeconds(prev => {
                const newSeconds = Math.max(0, prev - 1); // Don't go below 0
                const newIsLowTime = newSeconds <= 6;

                // Timer logic

                setIsLowTime(newIsLowTime);
                return newSeconds;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetTime, nextPhase]);

    const formatTime = (seconds: number): string => {
        if (seconds <= 0) return '0';
        return seconds.toString();
    };

    const getPhaseName = (phase: string): string => {
        switch (phase) {
            case 'PreDraft': return 'Obserwacja';
            case 'Draft': return 'Draft';
            case 'MainCompetition': return 'Konkurs';
            case 'Ended': return 'Wyniki końcowe';
            case 'Break': throw new Error('Break phase should not be displayed');
            default: return phase;
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <h3 className="text-white/80 text-sm font-medium text-center">
                Przejście do kolejnej fazy za:
            </h3>

            <motion.div
                className={`
                    relative flex items-center justify-center w-24 h-24 rounded-full border-2
                    ${isLowTime
                        ? 'bg-orange-600/20 border-orange-500'
                        : 'bg-white/10 border-white/40'
                    }
                `}
                animate={isLowTime ? {
                    rotate: [-2, 2, -2, 2, 0],
                    transition: {
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse" as const
                    }
                } : {}}
            >
                {/* Time text */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold leading-none text-white">
                        {formatTime(remainingSeconds)}
                    </span>
                    <span className="text-xs font-medium leading-none mt-1 text-white/80">
                        sekund
                    </span>
                </div>
            </motion.div>

            <div className="text-center">
                <p className="text-white/60 text-xs">
                    Następna faza:
                </p>
                <p className="text-white font-semibold text-sm">
                    {getPhaseName(nextPhase)}
                </p>
            </div>
        </div>
    );
}
