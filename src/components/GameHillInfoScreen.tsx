'use client';
import { Countdown } from '@/components/ui/Countdown';

interface Hill {
    location: string;
    hs: number;
    countryCode: string;
    id?: string;
}

interface HillInfoProps {
    hill: Hill;
    targetUtc: string | null;
}

export function GameHillInfoScreen({ hill, targetUtc }: HillInfoProps) {
    // zakładamy flagi w /flags/PL.svg
    // const flagSrc = `/flags/${hill.countryCode.toUpperCase()}.svg`;
    // const hillImageSrc = `https://cdn.example.com/hills/${hill.id}.jpg`;
    const flagSrc = '/flags/de.svg';
    const hillImageSrc = '/hillImages/oberek.jpg'

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-4xl font-extrabold mb-6">
                        Wybór padł na… {hill.location} HS{hill.hs}!
                        <img
                            src={flagSrc}
                            alt={hill.countryCode}
                            className="inline-block h-8 w-8 ml-3 rounded-lg shadow-md object-cover"
                        />
                    </h2>

                    <div className="relative overflow-hidden rounded-xl border-4 border-white/40 shadow-lg">
                        <img
                            src={hillImageSrc}
                            alt={hill.location}
                            className="h-72 w-full object-cover"
                        />
                        <div className="absolute bottom-3 left-3 bg-black/60 px-4 py-1 rounded-lg text-sm font-medium backdrop-blur">
                            {hill.location} HS{hill.hs}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <Countdown targetUtc={targetUtc} />
                </div>
            </div>
        </div>
    );
}