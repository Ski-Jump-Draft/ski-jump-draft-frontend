'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface DraftOrderEmptyStateProps {
    orderPolicy?: 'Classic' | 'Snake' | 'Random';
    timeoutInSeconds?: number | null;
}

export const DraftOrderEmptyState = ({ orderPolicy, timeoutInSeconds }: DraftOrderEmptyStateProps) => {
    return (
        <Card className="p-4 bg-neutral-800 border-neutral-700 text-white h-full flex flex-col justify-between">
            <div>
                <h4 className="font-semibold text-lg mb-4">Kolejność Draftu</h4>

                {/* Current Picker Placeholder */}
                <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Teraz wybiera:</p>
                    <div
                        className={cn(
                            "border border-blue-500/50 rounded-lg p-3 flex items-center gap-3",
                            orderPolicy === 'Random' && 'animate-pulse bg-blue-600/20'
                        )}
                    >
                        {orderPolicy === 'Random' ? (
                            <span className="font-bold text-lg text-blue-300">Kolejność losowa. Bądź przygotowany!</span>
                        ) : (
                            <div className="h-6 w-3/4 bg-neutral-700 animate-pulse rounded" />
                        )}
                    </div>
                </div>

                {/* Upcoming Pickers Placeholder */}
                <div>
                    <p className="text-sm text-gray-400 mb-2">Następni w kolejce:</p>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="bg-neutral-700/50 rounded-lg p-2 flex items-center gap-3 opacity-80">
                                <span className="text-gray-400 font-mono text-sm">{index + 1}.</span>
                                <div className="h-5 w-5 rounded-full bg-neutral-600 animate-pulse" />
                                <div className="h-5 w-1/2 bg-neutral-600 animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Policy Info */}
            {orderPolicy && orderPolicy !== 'Random' && (
                <div className="mt-4 text-sm text-gray-400 p-2 bg-neutral-900/50 rounded-md flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>
                        {orderPolicy === 'Classic'
                            ? 'System klasyczny (A, B, C, A, B, C...)'
                            : 'System snake (A, B, C, C, B, A...)'}
                    </span>
                </div>
            )}

            {/* Timeout Info */}
            {/* {timeoutInSeconds && (
                <div className="mt-2 text-sm text-gray-400 p-2 bg-neutral-900/50 rounded-md">
                    <span>Czas na wybór: {timeoutInSeconds} sekund</span>
                </div>
            )} */}
        </Card>
    );
};
