'use client';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';

interface CountdownProps {
    targetUtc: string | null;
    urgentThreshold?: number; // red at 0, yellow at threshold
    size?: number; // px
}

export function Countdown({ targetUtc, urgentThreshold = 5, size = 96 }: CountdownProps) {
    const secondsLeft = useCountdown(targetUtc);
    const seconds = secondsLeft !== null ? Math.max(secondsLeft, 0) : null;

    let borderColour = 'border-neutral-700';
    if (seconds === 0) borderColour = 'border-red-500';
    else if (seconds !== null && seconds <= urgentThreshold) borderColour = 'border-yellow-500';

    const showSpinner = seconds === 0;

    return seconds === null ? null : (
        <div className="flex flex-col items-center space-y-1 text-center">
            <span className="text-sm text-neutral-400">Przejście dalej za…</span>
            <div className="flex items-center">
                <div
                    className={cn(
                        'flex flex-col items-center justify-center rounded-full border-4 transition-colors',
                        borderColour
                    )}
                    style={{ width: size, height: size }}
                >
                    <span className="text-3xl font-bold text-white">{seconds}</span>
                    <span className="text-xs text-white">sekund</span>
                </div>
                {showSpinner && (
                    <div className="ml-4 h-6 w-6 animate-spin rounded-full border-2 border-l-transparent border-b-transparent border-red-500" />
                )}
            </div>
        </div>
    );
}
