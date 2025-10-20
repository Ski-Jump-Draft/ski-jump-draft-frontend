"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function CreditsDialog() {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 hover:text-slate-200 transition-colors z-50">
            <Dialog>
                <DialogTrigger asChild>
                    <button className="font-medium bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-700/50 hover:bg-slate-700/40 backdrop-blur-md transition-all duration-200">
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
                            <a href="https://pl.m.wikipedia.org/wiki/Plik:POL_Wis%C5%82a_Malinka_Skocznia.JPG#file"
                                target="_blank"
                                className="underline text-slate-400 hover:text-slate-200 ml-1">
                                D T G (CC 3.0)
                            </a>
                        </li>
                    </ul>
                </DialogContent>
            </Dialog>
        </div>
    );
}
