import { useEffect, useState } from 'react';

export function useCountdown(targetUtc: string | null, refreshMs = 250) {
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!targetUtc) return;

        const target = new Date(targetUtc).getTime();

        const update = () => {
            const diff = Math.ceil((target - Date.now()) / 1000);
            setSecondsLeft(diff);
        };

        update();
        const id = setInterval(update, refreshMs);

        return () => clearInterval(id);
    }, [targetUtc, refreshMs]);

    return secondsLeft; // może być <0 gdy minęło
}