"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoringPolicyDialog } from "@/components/ui/ScoringPolicyDialog";
import { cn } from "@/lib/utils";
import { Trophy, Share2, Info, Home } from "lucide-react";

interface PlayerResult {
    playerId: string;
    nick: string;
    points: number;
    position: number;
    isMe?: boolean;
}

type EndPolicy = "Classic" | "PodiumAtAllCosts";

interface GameEndedScreenProps {
    results: PlayerResult[];
    onBackToMenu?: () => void;
    shareUrl?: string;
    myPlayerId?: string | null;
    policy?: EndPolicy;
    // Hill info to build the title
    hillName?: string;
    hillHs?: number;
    hillCountryCode?: string; // FIS/alpha2
    // Optional override title
    title?: string;
}

function countryCodeToFlag(code?: string) {
    // Expect alpha-2 uppercase (e.g., IT)
    if (!code) return "";
    const cc = code.trim().toUpperCase();
    if (cc.length !== 2) return "";
    const OFFSET = 127397; // regional indicator offset
    return String.fromCodePoint(cc.charCodeAt(0) + OFFSET, cc.charCodeAt(1) + OFFSET);
}

export function GameEndedScreen({
    results,
    onBackToMenu,
    shareUrl,
    myPlayerId,
    policy = "Classic",
    hillName,
    hillHs,
    hillCountryCode,
    title,
}: GameEndedScreenProps) {
    const [open, setOpen] = useState(false);
    const sorted = useMemo(() => [...results].sort((a, b) => a.position - b.position), [results]);

    const flag = countryCodeToFlag(hillCountryCode);
    const headerTitle = title ?? (hillName && hillHs ? `SJ Draft – ${hillName} HS${hillHs} ${flag}` : "SJ Draft – Wyniki końcowe");

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white p-6 overflow-y-auto">
            <div className="w-full max-w-5xl space-y-8">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-4 mr-5">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
                            <Trophy className="w-7 h-7 text-black" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{headerTitle}</h1>
                            <p className="text-sm text-neutral-300">Wyniki końcowe</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-white/20" onClick={() => setOpen(true)}>
                            <Info className="w-4 h-4 mr-2" /> Jak liczone są punkty?
                        </Button>
                        {shareUrl && (
                            <Button
                                variant="secondary"
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="bg-blue-600 hover:bg-blue-500 text-white"
                            >
                                <Share2 className="w-4 h-4 mr-2" /> Udostępnij grę
                            </Button>
                        )}
                        <Button variant="outline" onClick={onBackToMenu}>
                            <Home className="w-4 h-4 mr-2" /> Menu główne
                        </Button>
                    </div>
                </header>

                <Card className="bg-neutral-900/60 border-neutral-800 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="p-6">
                            {/* <h2 className="text-lg font-semibold mb-4">Top 3</h2> */}
                            <div className="space-y-3">
                                {sorted.slice(0, 3).map((r) => (
                                    <div
                                        key={r.playerId}
                                        className={cn(
                                            "relative flex items-center justify-between rounded-xl border p-3 transition-shadow",
                                            "bg-gradient-to-br from-yellow-500/10 to-yellow-200/5 border-yellow-500/30",
                                            r.isMe && "ring-4 ring-blue-400/60 border-blue-400/50 shadow-xl shadow-blue-500/20 bg-blue-600/15"
                                        )}
                                    >
                                        {r.isMe && (
                                            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow">
                                                TY
                                            </span>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                                                r.position === 1 ? "bg-yellow-400 text-black" : r.position === 2 ? "bg-neutral-200 text-black" : "bg-amber-700"
                                            )}>
                                                {r.position}
                                            </div>
                                            <div className={cn("text-lg font-semibold", r.isMe && "text-white font-extrabold")}>{r.nick}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={cn("text-xl font-extrabold", r.isMe && "text-white")}>{Math.round(r.points)}p</div>
                                            <div className="text-xs text-neutral-400">łącznie</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t md:border-t-0 md:border-l border-neutral-800">
                            {/* <h2 className="text-lg font-semibold mb-4">Pozostali</h2> */}
                            <div className="space-y-2">
                                {sorted.slice(3).map((r) => (
                                    <div
                                        key={r.playerId}
                                        className={cn(
                                            "relative flex items-center justify-between rounded-lg border border-neutral-800 p-3 transition-shadow",
                                            r.isMe ? "bg-blue-600/15 border-blue-400/50 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20" : "bg-neutral-800/60 hover:bg-neutral-800"
                                        )}
                                    >
                                        {r.isMe && (
                                            <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow">
                                                TY
                                            </span>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-md bg-neutral-700 text-white flex items-center justify-center font-bold">
                                                {r.position}
                                            </div>
                                            <div className={cn(r.isMe && "text-white font-bold")}>{r.nick}</div>
                                        </div>
                                        <div className={cn("text-right text-neutral-200 font-semibold", r.isMe && "text-white font-extrabold")}>{Math.round(r.points)}p</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <ScoringPolicyDialog
                open={open}
                onOpenChange={setOpen}
                policy={policy}
            />
        </div>
    );
}
