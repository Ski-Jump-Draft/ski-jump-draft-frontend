import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { fisToAlpha2 } from '@/utils/countryCodes';
import { GameJumperDto } from '@/types/game';

interface PlayerPicksTooltipProps {
    playerNick: string;
    jumpers: GameJumperDto[];
    className?: string;
    children: React.ReactNode;
}

export function PlayerPicksTooltip({ playerNick, jumpers, className, children }: PlayerPicksTooltipProps) {
    const [open, setOpen] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: 'bottom' as 'bottom' | 'top' });
    const containerRef = useRef<HTMLDivElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node) && !tooltipRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [open]);

    // Calculate tooltip position
    useEffect(() => {
        if (!open || !containerRef.current) return;

        const updatePosition = () => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const tooltipHeight = Math.min(300, jumpers.length * 40 + 80);
            const tooltipWidth = 256; // w-64 = 16rem = 256px
            const margin = 12;

            // Calculate available space
            const spaceBelow = window.innerHeight - containerRect.bottom;
            const spaceAbove = containerRect.top;

            // Determine placement
            const placement = spaceBelow < tooltipHeight + margin && spaceAbove > tooltipHeight + margin ? 'top' : 'bottom';

            // Calculate X position (centered)
            let x = containerRect.left + containerRect.width / 2 - tooltipWidth / 2;

            // Keep tooltip within viewport horizontally
            x = Math.max(margin, Math.min(x, window.innerWidth - tooltipWidth - margin));

            // Calculate Y position
            let y: number;
            if (placement === 'bottom') {
                y = containerRect.bottom + margin;
            } else {
                y = containerRect.top - tooltipHeight - margin;
            }

            setTooltipPosition({ x, y, placement });
        };

        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, jumpers.length]);

    const toggle = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setOpen((prev) => !prev);
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    };

    const getCountryFlag = (countryCode: string) => {
        const alpha2Code = fisToAlpha2(countryCode) || 'xx';
        return `/flags/${alpha2Code}.svg`;
    };

    const renderTooltip = () => {
        if (!open) return null;

        return createPortal(
            <div
                ref={tooltipRef}
                className="fixed w-64 rounded-lg border border-gray-600 bg-gray-700 shadow-2xl text-sm transition-opacity"
                style={{
                    left: `${tooltipPosition.x}px`,
                    top: `${tooltipPosition.y}px`,
                    zIndex: 99999,
                }}
            >
                {/* Header */}
                <div className="px-3 pt-3 pb-2 border-b border-gray-500">
                    <span className="font-bold text-gray-100 text-sm">
                        Zawodnicy gracza {playerNick}
                    </span>
                </div>

                {/* Jumpers list */}
                <div className="p-2 max-h-64 overflow-y-auto">
                    {jumpers.length > 0 ? (
                        <div className="space-y-1">
                            {jumpers.map((jumper) => (
                                <div
                                    key={jumper.gameJumperId}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-600/50 transition-colors"
                                >
                                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${jumper.name}`}
                                            alt={jumper.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <img
                                        src={getCountryFlag(jumper.countryFisCode)}
                                        alt={jumper.countryFisCode}
                                        className="w-5 h-3 object-cover rounded flex-shrink-0"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <span className="text-xs text-gray-100 font-medium truncate">
                                        {jumper.name} {jumper.surname}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 text-center text-gray-400 text-xs">
                            Brak wybranych zawodników
                        </div>
                    )}
                </div>
            </div>,
            document.body
        );
    };

    return (
        <>
            <div ref={containerRef} className={cn('relative', className)}>
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => toggle(e)}
                    onKeyDown={onKeyDown}
                    title={`Kliknij, aby zobaczyć zawodników gracza ${playerNick}`}
                    className="w-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-lg"
                >
                    {children}
                </div>
            </div>
            {renderTooltip()}
        </>
    );
}

