'use client';

import { JSX, useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useRef } from "react";
import { createPortal } from "react-dom";

type Slide = {
    title: string;
    image: string;
    description: string | JSX.Element;
    tips?: { text: string; image: string }[];
};

const slides: Slide[] = [
    {
        title: 'Matchmaking',
        image: '/assets/tutorial/1_matchmaking.png',
        description: (
            <>
                Wpisz nick, dołącz do gry i czekaj na innych graczy. <br />
                Spokojnie, jeśli nikt nie dołączy, wyślemy trochę botów, żeby gra była ciekawsza 😉
            </>
        ),
    },
    {
        title: 'Faza obserwacji (Pre-Draft)',
        image: '/assets/tutorial/2_predraft.png',
        description: (
            <>
                Przed Tobą dwie sesje treningowe, podczas których zawodnicy zaprezentują swoją formę.
                Skoki treningowe pomogą Ci wybrać najlepszych na konkurs. <br />
                Podczas fazy obserwacji nie wiadomo jeszcze, jakie zasady będzie miał Draft i jaka będzie punktacja za miejsca skoczków konkursie — bądź
                przygotowany na każdy scenariusz 🙃
            </>
        ),
        tips: [
            {
                text: 'Kliknij na wynik skoczka w tabeli, by zobaczyć informację o wietrze, belce i punktach za styl.',
                image: '/assets/tutorial/3_jump_details.png',
            },
        ],
    },
    {
        title: 'Draft',
        image: '/assets/tutorial/4_draft.png',
        description: (
            <>
                Czas na skompletowanie swojego składu na konkurs.
                Na tym ekranie zobaczysz zasady Draftu: ile skoczków wybierzesz, jaka jest kolejność wyboru i
                punktacja w grze. <br />
                <b>Aby wybrać skoczka, kliknij dwa razy na wynik w tabeli.</b> <br />
                Postawisz na sprawdzonych liderów, a może niepewną rewelację sesji treningowych? 🤔
                <br />
                <br />
                Wskazówka: kolejność <b>Snake</b> oznacza A→B→C→C→B→A
            </>
        ),
        tips: [
            {
                text: 'Kliknij na tekst przy "Punktacja", aby sprawdzić punktację w konkursie głównym.',
                image: '/assets/tutorial/5_draft_rules.png',
            },
        ],
    },
    {
        title: 'Konkurs',
        image: '/assets/tutorial/7_competition.png',
        description: (
            <>
                Po wybraniu skoczków następuje dwuseryjny konkurs w stylu Pucharu Świata.
                Im wyższe pozycje zajmą Twoi zawodnicy, tym więcej punktów zdobędziesz.
                Twoi zawodnicy są wyróżnieni kolorem 🤗
            </>
        ),
        tips: [
            {
                text: (
                    <>
                        Sprawdź szczegóły punktacji klikając przycisk <b>"Jak liczone są punkty?"</b>
                    </>
                ) as any,
                image: '/assets/tutorial/8_competition_scoring_rules.png',
            },
        ],
    },
    {
        title: 'Wyniki rozgrywki',
        image: '/assets/tutorial/9_game_results.png',
        description: (
            <>
                Czy Twoje wybory okazały się trafne? Wyniki końcowe ukazują się na tym ekranie.
                Punktacja zależy od zasad przedstawionych przy rozpoczęciu Draftu i miejsc Twoich zawodników w
                konkursie. <br />
                Jeśli spodobała Ci się rozgrywka — udostępnij ją znajomym 😇
            </>
        ),
    },
];

export function TutorialDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [index, setIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        setImageLoaded(false);
    }, [index]);

    // Obsługa klawiatury (← →)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!open) return;
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [index, open]);



    const next = () => setIndex((i) => Math.min(i + 1, slides.length - 1));
    const prev = () => setIndex((i) => Math.max(i - 1, 0));
    const slide = slides[index];

    const imgRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoom] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const handleMove = (e: React.MouseEvent) => {
        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({ x, y });
    };

    const [zoomed, setZoomed] = useState(false);


    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    onInteractOutside={(e) => { if (zoomed) e.preventDefault(); }}
                    onPointerDownOutside={(e) => { if (zoomed) e.preventDefault(); }}
                    onEscapeKeyDown={(e) => {
                        if (zoomed) { e.preventDefault(); setZoomed(false); } // najpierw zamknij lupę
                        else onClose(); // normalne zamknięcie dialogu
                    }}
                    className="max-w-3xl w-[92vw] sm:w-[720px] bg-slate-900 border border-slate-700 
             text-slate-100 rounded-2xl shadow-2xl p-0 overflow-hidden"
                >

                    <DialogHeader className="p-4 pb-2 border-b border-slate-700/50">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-blue-300 tracking-wide">
                            {slide.title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-5 sm:p-6 flex flex-col items-center gap-5 text-left">
                        {/* Główne zdjęcie */}
                        <div
                            className="relative w-full flex justify-center items-center overflow-hidden rounded-2xl border border-slate-700 shadow-lg cursor-zoom-in"
                            onClick={() => setZoomed(true)}
                        >
                            {!imageLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                                </div>
                            )}
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                width={1000}
                                height={650}
                                onLoadingComplete={() => setImageLoaded(true)}
                                className={cn(
                                    'object-cover w-full max-h-[480px] rounded-2xl transition-transform duration-300 hover:scale-105',
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                )}
                            />
                        </div>


                        {/* Opis */}
                        <div className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed space-y-2">
                            {slide.description}
                        </div>

                        {/* Tipy */}
                        {slide.tips && (
                            <div className="mt-4 space-y-3 w-full max-w-2xl">
                                {slide.tips.map((tip, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800/40 border border-slate-700/40 rounded-xl p-3"
                                    >
                                        <div className="flex-shrink-0 relative w-full sm:w-44 h-28 sm:h-24">
                                            <Image
                                                src={tip.image}
                                                alt="tip"
                                                fill
                                                className="object-contain rounded-lg"
                                            />
                                        </div>
                                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed sm:text-left text-center">
                                            {tip.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Nawigacja */}
                    <div className="flex justify-between items-center p-4 border-t border-slate-700/50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={prev}
                            disabled={index === 0}
                            className="gap-1 text-slate-300 border-slate-600/50 hover:bg-slate-800/50"
                        >
                            <ChevronLeft className="h-4 w-4" /> Wstecz
                        </Button>

                        <div className="text-xs text-slate-500 tracking-wide">
                            {index + 1} / {slides.length}
                        </div>

                        {index < slides.length - 1 ? (
                            <Button
                                size="sm"
                                onClick={next}
                                className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 transition-all"
                            >
                                Dalej <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={onClose}
                                className="bg-green-600 hover:bg-green-500 text-white"
                            >
                                Zakończ
                            </Button>
                        )}
                    </div>



                </DialogContent>
                {zoomed && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        {/* półprzezroczyste tło – zamyka tylko lupę */}
                        <div
                            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-auto"
                            onClick={(e) => { e.stopPropagation(); setZoomed(false); }}
                        />
                        {/* powiększony obrazek */}
                        <div
                            className="relative z-10 pointer-events-auto rounded-2xl border border-slate-700/60 shadow-2xl
                 bg-slate-900/90 p-3 animate-in fade-in-0 zoom-in-95
                 transition-transform duration-200 ease-out"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                width={1200}
                                height={800}
                                className="object-contain max-w-[85vw] max-h-[70vh] rounded-lg"
                            />
                        </div>
                    </div>
                )}


            </Dialog>
        </>
    );

}
