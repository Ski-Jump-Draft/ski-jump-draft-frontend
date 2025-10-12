'use client';

import { Card } from '@/components/ui/card';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Player {
    playerId: string;
    nick: string;
    isBot: boolean;
}

interface PlayersListProps {
    players: Player[];
    className?: string;
    style?: React.CSSProperties;
    renderPlayer?: (player: Player, defaultContent: React.ReactNode) => React.ReactNode;
}

export function PlayersList({ players, className, style, renderPlayer }: PlayersListProps) {
    return (
        <Card className={cn("p-3 lg:p-4 flex flex-col lg:h-[40%] lg:max-h-[40vh]", className)} style={style}>
            <h3 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-foreground flex-shrink-0">Gracze</h3>
            <div className="space-y-1 lg:space-y-2 lg:flex-1 lg:overflow-y-auto lg:min-h-0 custom-scrollbar">
                {players.map((player) => {
                    const defaultContent = (
                        <div className="flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            {player.isBot ? (
                                <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                            ) : (
                                <User className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                            )}
                            <span className="text-sm lg:font-medium text-foreground truncate">{player.nick}</span>
                        </div>
                    );

                    return (
                        <div key={player.playerId}>
                            {renderPlayer ? renderPlayer(player, defaultContent) : defaultContent}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

