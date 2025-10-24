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
import Image from "next/image";
import { cn } from "@/lib/utils";
import { WeeklyTopJumpsDialog } from "./WeeklyTopJumpsDialog";

export function WeeklyTopJumps() {
    const [jumps, setJumps] = useState<WeeklyTopJumpDto[]>([]);
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getJumperById } = useJumperData();

    useEffect(() => {
        const fetchJumps = async () => {
            try {
                const data = await getWeeklyTopJumps();
                console.log(data);
                setJumps(data);
            } catch (err) {
                setError("Failed to load weekly top jumps");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJumps();
    }, []);

    const fmt = (v?: number) =>
        typeof v === "number" && !isNaN(v) ? v.toFixed(1) : "—";

    const fmtDate = (d?: string) =>
        d && !isNaN(Date.parse(d)) ? format(new Date(d), "MMM d, yyyy") : "—";

    const top5Jumps = jumps.slice(0, 5);

    if (isLoading || error || jumps.length < 20) return null;

    return (
        <Card className="w-full bg-slate-900/20 border-slate-700/30 shadow-sm">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3">
                    <CardTitle className="text-sm font-medium text-slate-400">Najdalsze skoki tygodnia</CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isOpen ? (
                                <ChevronUp className="h-3 w-3" />
                            ) : (
                                <ChevronDown className="h-3 w-3" />
                            )}
                            <span className="sr-only">
                                Przełącz widoczność najdalszych skoków
                            </span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent className="px-4 py-3">
                        <div className="space-y-2">
                            {top5Jumps.map((jump, index) => {
                                const jumper = getJumperById(jump.gameWorldJumperId);
                                const flagCode = jumper?.nationality?.toLowerCase() || "xx";

                                return (
                                    <div
                                        key={`${jump.gameId}-${jump.gameWorldJumperId}`}
                                        className={cn(
                                            "flex items-center space-x-2 p-2 rounded-md text-xs",
                                            index === 0
                                                ? "bg-yellow-900/20 border border-yellow-700/30"
                                                : "hover:bg-slate-800/30"
                                        )}
                                    >
                                        <div className="relative w-8 h-8 flex-shrink-0">
                                            {jumper?.photoUrl ? (
                                                <Image
                                                    src={jumper.photoUrl}
                                                    alt={jumper?.name || "Jumper"}
                                                    className="rounded-full object-cover"
                                                    fill
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-700" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-1">
                                                <Image
                                                    src={`/flags/${jump.jumperCountryCode?.toLowerCase() || "xx"}.svg`}
                                                    alt={jump.jumperCountryCode || ""}
                                                    width={14}
                                                    height={10}
                                                    className="rounded"
                                                />
                                                <p className="text-xs font-medium truncate text-slate-300">
                                                    {jump.name} {jump.surname}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                {jump.hillLocation} ({jump.hillCountryCode}) • {fmtDate(jump.gameCreatedAt)}
                                            </p>
                                        </div>


                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-semibold text-slate-200">
                                                {fmt(jump.distance)}m
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                K{jump.kPoint ?? "?"} HS{jump.hsPoint ?? "?"}
                                            </p>
                                        </div>

                                        {jump.draftPlayerNicks?.length > 0 && (
                                            <div className="text-xs bg-blue-900/30 border border-blue-700/30 px-1.5 py-0.5 rounded text-blue-300">
                                                {jump.draftPlayerNicks.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {jumps.length > 5 && (
                                <WeeklyTopJumpsDialog
                                    jumps={jumps}
                                    trigger={
                                        <Button variant="outline" size="sm" className="w-full mt-2 text-xs h-7 text-slate-400 border-slate-700/50 hover:bg-slate-800/30">
                                            Pokaż wszystkie ({jumps.length})
                                        </Button>
                                    }
                                />
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}
