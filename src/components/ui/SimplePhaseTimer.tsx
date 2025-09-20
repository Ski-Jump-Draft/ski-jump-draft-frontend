'use client';

import { useState, useEffect } from 'react';

interface SimplePhaseTimerProps {
    label: string;
    timeSpan: string;
    subtractSeconds?: number;
    paused?: boolean;
    muted?: boolean;
    initialSeconds?: number; // when provided, start from this value instead of parsing timeSpan
}

export const SimplePhaseTimer = ({ label, timeSpan, subtractSeconds = 0, paused = false, muted = false, initialSeconds }: SimplePhaseTimerProps) => {
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const parseTimeSpan = (ts: string): number => {
            if (!ts) return 0;
            const parts = ts.split(':');
            if (parts.length === 3) {
                const hours = parseInt(parts[0], 10);
                const minutes = parseInt(parts[1], 10);
                const secs = parseInt(parts[2], 10);
                return hours * 3600 + minutes * 60 + secs;
            }
            return 0;
        };

        const base = initialSeconds != null
            ? Math.max(0, initialSeconds)
            : Math.max(0, parseTimeSpan(timeSpan) - subtractSeconds);

        setRemaining(base);

        if (paused) return; // do not start countdown when paused

        const interval = setInterval(() => {
            setRemaining(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [timeSpan, subtractSeconds, paused, initialSeconds]);

    const bgClass = remaining <= 3
        ? 'bg-red-600'
        : remaining <= 10
            ? 'bg-yellow-600'
            : 'bg-blue-600';

    const wrapperClasses = [
        'px-5', 'py-2.5', 'rounded-full', 'text-white', 'font-bold', 'text-lg', 'shadow',
        'transition-colors', 'duration-500',
        paused ? 'ring-1 ring-white/20' : '',
        muted ? 'opacity-80' : '',
        bgClass,
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label} za {remaining} sek.
        </div>
    );
};
