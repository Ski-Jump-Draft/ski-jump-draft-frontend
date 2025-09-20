'use client';

import { Card } from '@/components/ui/card';
import { GamePlayerDto, PlayerPicksDto, GameJumperDto } from '@/types/game';
import { fisToAlpha2 } from '@/utils/countryCodes';
import { User, Bot } from 'lucide-react';

interface DraftPicksProps {
    players: GamePlayerDto[];
    picks: PlayerPicksDto[];
    jumpers: GameJumperDto[];
    currentPlayerId?: string | null;
    myPlayerId: string;
    isBreak?: boolean;
}

export const DraftPicks = ({ players, picks, jumpers, currentPlayerId, myPlayerId, isBreak = false }: DraftPicksProps) => {

    const getPlayer = (id: string) => players.find(p => p.playerId === id);
    const getJumper = (id: string) => jumpers.find(j => j.gameJumperId === id);

    const playersToDisplay = isBreak ? players.map(p => ({ playerId: p.playerId, jumperIds: [] })) : picks;

    return (
        <Card className="bg-neutral-800 border-neutral-700 text-white h-full flex flex-col overflow-hidden">
            <div className="p-4 border-b border-neutral-700">
                <h3 className="text-xl font-bold">Wybrani skoczkowie</h3>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {playersToDisplay.map(playerPick => {
                    const player = getPlayer(playerPick.playerId);
                    const isCurrent = player?.playerId === currentPlayerId;
                    const isMe = player?.playerId === myPlayerId;

                    let cardClasses = 'transition-all duration-300';
                    if (isCurrent && isMe) {
                        cardClasses += ' bg-red-600/20 ring-2 ring-red-500 animate-pulse'; // Shouting
                    } else if (isCurrent) {
                        cardClasses += ' bg-blue-600/20'; // Highlight current
                    }

                    return (
                        <div key={playerPick.playerId} className={`p-4 border-b border-neutral-700/50 ${cardClasses}`}>
                            <div className="flex items-center gap-3 mb-3">
                                {player?.isBot ? <Bot className="w-6 h-6 text-red-400" /> : <User className="w-6 h-6 text-green-400" />}
                                <span className={`font-bold text-lg ${isCurrent && isMe ? 'text-red-300' : 'text-white'}`}>{player?.nick || 'Unknown'}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-9">
                                {playerPick.jumperIds.length > 0 ? (
                                    playerPick.jumperIds.map(jumperId => {
                                        const jumper = getJumper(jumperId);
                                        return jumper ? (
                                            <div key={jumperId} className="flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-neutral-700 text-white">
                                                <img
                                                    src={`/flags/${fisToAlpha2(jumper.countryFisCode) || 'xx'}.svg`}
                                                    alt={jumper.countryFisCode}
                                                    className="w-5 h-3.5 rounded-sm object-cover"
                                                />
                                                <span>{jumper.name} {jumper.surname}</span>
                                            </div>
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Oczekuje na wybór...</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
