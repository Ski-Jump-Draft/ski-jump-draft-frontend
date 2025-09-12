'use client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

export interface MatchmakingDialogProps {
    open: boolean;
    current: number;
    max: number;
    status: 'waiting' | 'starting' | 'failed';
    reason?: string;
    onCancel: () => void;
}
export function MatchmakingDialog({
    open,
    current,
    max,
    status,
    reason,
    onCancel,
}: MatchmakingDialogProps) {
    const percent = max != null && max > 0 ? (current / max) * 100 : 0;
    const dots = useDots();

    let title: string;
    if (status === 'failed') {
        title = reason ? `Matchmaking nie powiódł się: ${reason}` : 'Matchmaking nie powiódł się';
    } else if (status === 'starting') {
        title = `Rozpoczynanie gry… ${current}${max ? `/${max}` : ""}`;
    } else {
        title = `Trwa dobieranie graczy${dots}`;
    }

    return (
        <Dialog open={open} onOpenChange={(o) => o || onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-center">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {status !== 'failed' ? (
                    <div className="flex flex-col items-center space-y-4 py-4">
                        {max != null && max > 0 ? (
                            <>
                                <span className="text-lg">{current}/{max}</span>
                                <Progress value={percent} className="w-56" />
                            </>
                        ) : (
                            // fallback gdy max nieznane – pokazuj chociaż licznik
                            <span className="text-lg">{current}</span>
                        )}
                    </div>
                ) : (
                    <p className="py-6 text-center text-red-500">Spróbuj ponownie za chwilę.</p>
                )}

                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="w-32 cursor-pointer transition active:scale-95"
                    >
                        {status === 'failed' ? 'Zamknij' : 'Przerwij'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
