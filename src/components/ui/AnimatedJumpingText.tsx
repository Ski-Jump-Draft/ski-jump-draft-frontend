'use client';

import { cn } from '@/lib/utils';

interface AnimatedJumpingTextProps {
    className?: string;
}

export function AnimatedJumpingText({ className }: AnimatedJumpingTextProps) {
    return (
        <div className={cn("flex items-center justify-center", className)}>
            <span className="text-sm font-bold text-white drop-shadow-lg animate-pulse">
                Zawodnik skacze
            </span>
        </div>
    );
}
