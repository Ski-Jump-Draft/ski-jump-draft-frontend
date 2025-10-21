"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CreditsDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
           2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
           C13.09 3.81 14.76 3 16.5 3
           19.58 3 22 5.42 22 8.5
           c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
                    </svg>
                    Podziękowania
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-slate-900/95 border-slate-700/70 backdrop-blur-xl rounded-2xl text-slate-300 text-sm leading-relaxed shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-slate-100 text-base font-semibold">
                        Podziękowania
                    </DialogTitle>
                </DialogHeader>
                <ul className="list-disc list-inside space-y-2 mt-2">
                    <li>Sztuczna inteligencja: Cursor, ChatGPT, JetBrains Junie – ogromne wsparcie w rozwoju</li>
                    <li>Grupa testerów beta (październik 2025)</li>
                    <li>Członkowie serwera DDD (Domain-Driven Design)</li>
                    <li>Barca – lista skoczków do testów</li>
                    <li>
                        Autor zdjęcia tła:
                        <a
                            href="https://pl.m.wikipedia.org/wiki/Plik:POL_Wis%C5%82a_Malinka_Skocznia.JPG#file"
                            target="_blank"
                            className="underline text-slate-400 hover:text-slate-200 ml-1"
                        >
                            D T G (CC 3.0)
                        </a>
                    </li>
                </ul>
            </DialogContent>
        </Dialog>
    );
}
