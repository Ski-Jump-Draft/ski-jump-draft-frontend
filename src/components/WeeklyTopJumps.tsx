'use client';

import { WeeklyTopJumpDto } from "@/types/weeklyTopJumps";
import { useEffect, useState } from "react";
import { getWeeklyTopJumps } from "@/lib/api/weeklyTopJumps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useJumperData } from "@/hooks/useJumperData";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fisToAlpha2 } from "@/utils/countryCodes";

const getFlagSrc = (fisCode?: string) => {
    const alpha2 = fisToAlpha2(fisCode || "") || "xx";
    return `/flags/${alpha2.toLowerCase()}.svg`;
};

export function WeeklyTopJumps() {
    const [jumps, setJumps] = useState<WeeklyTopJumpDto[]>([]);

    useEffect(() => {
        const fetchJumps = async () => {
            try {
                const data = await getWeeklyTopJumps();
                setJumps(Array.isArray(data) ? data : []); // <— ważne
            } catch (err) {
                console.error(err);
                setError("Failed to load weekly top jumps");
            } finally {
                setIsLoading(false);
            }
        };
        fetchJumps();
    }, []);


    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getJumperById } = useJumperData();

    const getJumperPhoto = (name?: string, surname?: string) =>
        name ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name + surname)}` : "";

    const fmt = (v?: number) =>
        typeof v === "number" && !isNaN(v) ? v.toFixed(1) : "—";

    const top5Jumps = jumps.slice(0, 5);

    return (
        <Card className="bg-slate-900/40 border-slate-800/60 shadow-none text-slate-300 text-xs backdrop-blur-md">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
                    <CardTitle className="text-sm font-medium text-slate-400">
                        Najdalsze skoki ostatnich 7 dni
                    </CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>

                <CollapsibleContent>
                    <CardContent className="px-4 py-3">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-20 text-slate-500 text-xs italic">
                                Ładowanie danych…
                            </div>
                        ) : error ? (
                            <div className="text-center text-slate-500 text-xs italic">
                                Nie udało się załadować danych.
                            </div>
                        ) : jumps.length < 5 ? (
                            <div className="flex justify-center items-center h-20 text-slate-500 text-xs italic">
                                Brak danych o najdalszych skokach.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {top5Jumps.map((jump) => {
                                    const jumper = getJumperById(jump.gameWorldJumperId);
                                    return (
                                        <div
                                            key={`${jump.gameId}-${jump.gameWorldJumperId}`}
                                            className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-slate-800/30"
                                        >
                                            <div className="flex items-center space-x-2 min-w-0">
                                                <img
                                                    src={getJumperPhoto(jump.name, jump.surname)}
                                                    alt=""
                                                    className="w-8 h-8 rounded-full border border-slate-700/40"
                                                />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1">
                                                        <img
                                                            src={getFlagSrc(jump.jumperCountryCode)}
                                                            alt={jump.jumperCountryCode || ""}
                                                            width={16}
                                                            height={12}
                                                            className="rounded shadow-sm"
                                                        />
                                                        <p className="truncate text-xs font-medium text-slate-300">
                                                            {jump.name} {jump.surname}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-slate-500">{jump.hillLocation}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-slate-200">
                                                    {fmt(jump.distance)}m
                                                </p>

                                                {Array.isArray(jump.draftPlayerNicks) &&
                                                    jump.draftPlayerNicks.length === 1 && (
                                                        <span
                                                            className="px-2 py-0.5 text-[10px] font-medium rounded-full
          bg-slate-700/40 text-slate-300 border border-slate-600/50 
          whitespace-nowrap"
                                                        >
                                                            {jump.draftPlayerNicks[0]}
                                                        </span>
                                                    )}
                                            </div>
                                        </div>

                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
