"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WeeklyTopJumpDto } from "@/types/weeklyTopJumps"
import Image from "next/image"
import { useJumperData } from "@/hooks/useJumperData"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface WeeklyTopJumpsDialogProps {
    jumps: WeeklyTopJumpDto[]
    trigger?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function WeeklyTopJumpsDialog({
    jumps,
    trigger,
    open,
    onOpenChange,
}: WeeklyTopJumpsDialogProps) {
    const { getJumperById } = useJumperData()

    const fmt = (v?: number) =>
        typeof v === "number" && !isNaN(v) ? v.toFixed(1) : "—"

    const fmtDate = (d?: string) =>
        d && !isNaN(Date.parse(d)) ? format(new Date(d), "MMM d, yyyy") : "—"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline">View All Jumps</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Weekly Top Jumps</DialogTitle>
                    <DialogDescription>
                        The best jumps from the last 7 days
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                        {jumps.map((jump, index) => {
                            const jumper = getJumperById(jump.gameWorldJumperId)
                            const flagCode = jumper?.nationality?.toLowerCase() || "xx"

                            return (
                                <div
                                    key={`${jump.gameId}-${jump.gameWorldJumperId}`}
                                    className={cn(
                                        "flex items-center space-x-4 p-4 rounded-lg",
                                        index === 0
                                            ? "bg-yellow-50 dark:bg-yellow-950"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-900"
                                    )}
                                >
                                    <div className="relative w-16 h-16">
                                        {jumper?.photoUrl ? (
                                            <Image
                                                src={jumper.photoUrl}
                                                alt={jumper?.name || "Jumper"}
                                                className="rounded-full object-cover"
                                                fill
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                            <Image
                                                src={`/flags/${flagCode}.svg`}
                                                alt={jumper?.nationality || ""}
                                                width={24}
                                                height={18}
                                                className="rounded"
                                            />
                                            <p className="text-lg font-medium">{jumper?.name ?? "Unknown"}</p>
                                        </div>

                                        <div className="flex items-center space-x-4 mt-1">
                                            <p className="text-sm text-muted-foreground">
                                                {fmtDate(jump.gameCreatedAt)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Gate: {jump.gate ?? "—"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Wind: {fmt(jump.windAverage)} m/s
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xl font-semibold">
                                            {fmt(jump.distance)}m
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            K{jump.kPoint ?? "?"} HS{jump.hsPoint ?? "?"}
                                        </p>
                                        <p className="text-lg font-bold">{fmt(jump.distance)} m</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
