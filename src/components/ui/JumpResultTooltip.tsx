import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CompetitionRoundResultDto } from '@/types/game';
import { fisToAlpha2 } from '@/utils/countryCodes';

interface JumpResultTooltipProps {
    round: CompetitionRoundResultDto;
    className?: string;
    children: React.ReactNode;
    startingGate?: number; // Only need starting gate for comparison
    jumperInfo?: { name: string; surname: string; countryFisCode: string };
}

export function JumpResultTooltip({ round, className, children, startingGate, jumperInfo }: JumpResultTooltipProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    // Check available space and set position
    useEffect(() => {
        if (!open || !containerRef.current || !tooltipRef.current) return;

        const container = containerRef.current;
        const tooltip = tooltipRef.current;
        const containerRect = container.getBoundingClientRect();

        // Calculate available space below and above
        const spaceBelow = window.innerHeight - containerRect.bottom;
        const spaceAbove = containerRect.top;

        // Tooltip height is approximately 250px (estimate - increased for safety)
        const tooltipHeight = 250;
        const margin = 40; // Increased margin to prevent clipping

        // If not enough space below but enough above, position on top
        if (spaceBelow < tooltipHeight + margin && spaceAbove > tooltipHeight + margin) {
            setPosition('top');
        } else {
            setPosition('bottom');
        }
    }, [open]);

    const toggle = () => setOpen((prev) => !prev);
    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    };

    const formatWind = (value: number) => {
        const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-foreground';
        return <span className={color}>{value.toFixed(2)} m/s</span>;
    };

    const formatCompensation = (value: number | null | undefined, showSign = true) => {
        if (value == null) return '—';
        const sign = showSign ? (value > 0 ? '+' : value < 0 ? '−' : '') : '';
        const absolute = Math.abs(value).toFixed(1);
        const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-foreground';
        return <span className={color}>{sign}{absolute} pkt</span>;
    };

    const windComp = round.windCompensation;
    const gateComp = round.gateCompensation;
    const totalComp = round.totalCompensation;

    // Determine what to show - only show if we have actual data (not null/undefined)
    const hasWindComp = windComp != null;
    const hasGateComp = gateComp != null;
    const hasBothComps = hasWindComp && hasGateComp;
    const hasOnlyWind = hasWindComp && !hasGateComp;
    const hasOnlyGate = !hasWindComp && hasGateComp;

    // Gate info
    const currentGate = round.gate;
    const gateChange = currentGate != null && startingGate != null ? currentGate - startingGate : null;
    const gateChangeStr = gateChange != null && gateChange !== 0 ? ` (${gateChange > 0 ? '+' : ''}${gateChange})` : '';

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            <div
                role="button"
                tabIndex={0}
                onClick={toggle}
                onKeyDown={onKeyDown}
                title="Kliknij, aby wyświetlić szczegóły"
                className="w-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-sm"
            >
                {children}
            </div>
            {open && (
                <div
                    ref={tooltipRef}
                    className={cn(
                        "absolute z-[9999] left-1/2 transform -translate-x-1/2 w-56 rounded-lg border border-gray-600 bg-gray-700 shadow-xl text-sm",
                        position === 'bottom' ? "top-full mt-2" : "bottom-full mb-2"
                    )}
                >
                    {/* Header with jumper info */}
                    {jumperInfo && (
                        <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-gray-500">
                            <img
                                src={`/flags/${fisToAlpha2(jumperInfo.countryFisCode) || 'xx'}.svg`}
                                alt={jumperInfo.countryFisCode}
                                className="w-5 h-3 object-cover rounded"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="font-bold text-gray-100 text-base">
                                {jumperInfo.name} {jumperInfo.surname}
                            </span>
                        </div>
                    )}

                    <div className="p-3">
                        {/* Wind - always show */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300 font-medium">Wiatr:</span>
                            {formatWind(round.windAverage)}
                        </div>

                        {/* Gate info - only show if we have gate data */}
                        {currentGate != null && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-300 font-medium">Belka:</span>
                                <span className="text-gray-100">{currentGate}{gateChangeStr}</span>
                            </div>
                        )}

                        {/* Show compensations only if they exist and are not zero */}
                        {hasBothComps && (
                            <>
                                {/* Wind compensation */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300 font-medium">Rekomp. (wiatr):</span>
                                    {formatCompensation(windComp)}
                                </div>

                                {/* Gate compensation */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300 font-medium">Rekomp. (belka):</span>
                                    {formatCompensation(gateComp)}
                                </div>

                                {/* Total compensation */}
                                <div className="flex items-center justify-between border-t border-gray-500 pt-2 mt-2">
                                    <span className="text-gray-300 font-semibold">Rekomp.:</span>
                                    {formatCompensation(totalComp)}
                                </div>
                            </>
                        )}

                        {hasOnlyWind && (
                            <>
                                {/* Wind compensation */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 font-semibold">Rekomp. (wiatr):</span>
                                    {formatCompensation(windComp)}
                                </div>
                            </>
                        )}

                        {hasOnlyGate && (
                            <>
                                {/* Gate compensation */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 font-semibold">Rekomp. (belka):</span>
                                    {formatCompensation(gateComp)}
                                </div>
                            </>
                        )}

                        {/* Style points - show if available */}
                        {round.judgePoints != null && (
                            <div className="flex items-center justify-between border-t border-gray-500 pt-2 mt-2">
                                <span className="text-gray-300 font-medium">Za styl:</span>
                                <span className="text-gray-100">{round.judgePoints.toFixed(1)}pkt</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
