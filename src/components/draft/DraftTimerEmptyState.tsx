'use client';

import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface DraftTimerEmptyStateProps {
    timeoutInSeconds: number;
}

export const DraftTimerEmptyState = ({ timeoutInSeconds }: DraftTimerEmptyStateProps) => {
    return (
        <Card className="p-4 bg-neutral-800 border-neutral-700 text-white flex flex-col justify-center items-center h-full">
            <Clock className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-400">Czas na wybór</p>
            <p className="text-3xl font-bold font-mono text-white">{timeoutInSeconds}s</p>
        </Card>
    );
};
