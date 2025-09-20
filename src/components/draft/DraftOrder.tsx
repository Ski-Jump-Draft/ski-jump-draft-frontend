'use client';

import { Card } from '@/components/ui/card';
import { GamePlayerDto } from '@/types/game';
import { User, Bot, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftOrderProps {
    players: GamePlayerDto[];
    nextPlayers: string[]; // array of playerIds
    currentPlayerId: string | null;
    orderPolicy?: 'Classic' | 'Snake' | 'Random';
    myPlayerId?: string;
}

export const DraftOrder = ({ players, nextPlayers, currentPlayerId, orderPolicy, myPlayerId }: DraftOrderProps) => {

    const getPlayer = (id: string) => players.find(p => p.playerId === id);

    const currentPlayer = currentPlayerId ? getPlayer(currentPlayerId) : null;

    // Next players are the ones after the current one in the nextPlayers list
    const currentPlayerIndex = currentPlayerId ? nextPlayers.indexOf(currentPlayerId) : -1;
    const upcomingPlayers = currentPlayerIndex !== -1
        ? nextPlayers.slice(currentPlayerIndex + 1, currentPlayerIndex + 4).map(getPlayer)
        : nextPlayers.slice(0, 3).map(getPlayer);

    // Debug: log draft order values
    console.log('DraftOrder Debug:', {
        nextPlayersRaw: nextPlayers,
        currentPlayerId,
        currentPlayerIndex,
        upcomingPlayersMapped: upcomingPlayers.map(p => p?.nick)
    });

    const isMyTurn = myPlayerId === currentPlayerId;

    // Hide upcoming players when policy is Random
    const showUpcoming = orderPolicy !== 'Random' && upcomingPlayers.length > 0;


    return (
        <Card className="p-4 bg-neutral-800 border-neutral-700 text-white flex flex-col justify-between h-full">
            <div>
                <h4 className="font-semibold text-lg mb-4">Kolejność Draftu</h4>

                {/* Current Picker */}
                {currentPlayer && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Teraz wybiera:</p>
                        <div className={cn(
                            "border rounded-lg p-3 flex items-center gap-3",
                            orderPolicy === 'Random' && isMyTurn && "bg-red-600/20 border-red-500 animate-pulse",
                            orderPolicy === 'Random' && !isMyTurn && "bg-blue-600/20 border-blue-500 animate-pulse",
                            orderPolicy !== 'Random' && "bg-blue-600/20 border-blue-500"
                        )}>
                            {currentPlayer.isBot ? <Bot className="w-6 h-6 text-red-400" /> : <User className="w-6 h-6 text-green-400" />}
                            <span className="font-bold text-lg">{currentPlayer.nick}</span>
                        </div>
                    </div>
                )}

                {/* Upcoming Pickers */}
                {orderPolicy === 'Random' ? (
                    <div className="mt-4">
                        <p className="text-sm text-gray-400">Kolejność losowa. Bądź przygotowany!</p>
                    </div>
                ) : showUpcoming && (
                    <div>
                        <p className="text-sm text-gray-400 mb-2">Następni w kolejce:</p>
                        <div className="space-y-2">
                            {upcomingPlayers.map((player, index) => player ? (
                                <div key={`${player.playerId}-${index}`} className="bg-neutral-700/50 rounded-lg p-2 flex items-center gap-3 opacity-80">
                                    <span className="text-gray-400 font-mono text-sm">{index + 1}.</span>
                                    {player.isBot ? <Bot className="w-5 h-5 text-red-400/70" /> : <User className="w-5 h-5 text-green-400/70" />}
                                    <span className="text-gray-300">{player.nick}</span>
                                </div>
                            ) : null)}
                        </div>
                    </div>
                )}
            </div>

            {/* Order Policy Info */}
            {orderPolicy && orderPolicy !== 'Random' && (
                <div className="mt-4 text-sm text-gray-400 p-2 bg-neutral-900/50 rounded-md flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>
                        {orderPolicy === 'Classic'
                            ? 'System klasyczny (A, B, C, A, B, C...)'
                            : 'System snake (A, B, C, C, B, A...)'}
                    </span>
                </div>
            )}
        </Card>
    );
};
