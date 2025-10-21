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
        <Card className="w-full">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Najdalsze skoki tygodnia</CardTitle>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {isOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                Przełącz widoczność najdalszych skoków
                            </span>
                        </Button>
                    </CollapsibleTrigger>
                </CardHeader>
                <CollapsibleContent>
                    <CardContent>
                        <div className="space-y-4">
                            {top5Jumps.map((jump, index) => {
                                const jumper = getJumperById(jump.GameJumperId);
                                const flagCode = jumper?.nationality?.toLowerCase() || "xx";

                                return (
                                    <div
                                        key={`${jump.GameId}-${jump.GameJumperId}`}
                                        className={cn(
                                            "flex items-center space-x-4 p-3 rounded-lg",
                                            index === 0
                                                ? "bg-yellow-50 dark:bg-yellow-950"
                                                : "hover:bg-gray-50 dark:hover:bg-gray-900"
                                        )}
                                    >
                                        <div className="relative w-12 h-12">
                                            {jumper?.photoUrl ? (
                                                <Image
                                                    src={jumper.photoUrl}
                                                    alt={jumper?.name || "Jumper"}
                                                    className="rounded-full object-cover"
                                                    fill
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <Image
                                                    src={`/flags/${flagCode}.svg`}
                                                    alt={jumper?.nationality || ""}
                                                    width={20}
                                                    height={15}
                                                    className="rounded"
                                                />
                                                <p className="text-sm font-medium truncate">
                                                    {jumper?.name ?? "Unknown"}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {fmtDate(jump.GameCreatedAt)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm font-semibold">
                                                {fmt(jump.Distance)}m
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                K{jump.KPoint ?? "?"} HS{jump.HsPoint ?? "?"}
                                            </p>
                                        </div>

                                        {jump.DraftPlayerNicks?.length > 0 && (
                                            <div className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                                                {jump.DraftPlayerNicks.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {jumps.length > 5 && (
                                <WeeklyTopJumpsDialog
                                    jumps={jumps}
                                    trigger={
                                        <Button variant="outline" className="w-full mt-2">
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
