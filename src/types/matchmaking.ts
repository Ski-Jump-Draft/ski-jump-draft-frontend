// Basic matchmaking-related DTOs mirrored from backend contracts (mapped to camelCase)

export interface MatchmakingPlayerDto {
    playerId: string;
    nick: string;
    isBot: boolean;
    joinedAt: string;
}

export interface MatchmakingUpdatedDto {
    matchmakingId: string;
    status: string; // e.g. "Running" | "Ended Succeeded" | "Ended NotEnoughPlayers" | "Failed"
    players: MatchmakingPlayerDto[];
    playersCount: number;
    requiredPlayersToMin?: number | null;
    minPlayers: number;
    maxPlayers: number;
    startedAt: string; // ISO
    forceEndAt: string; // ISO
    endedAt?: string | null; // ISO or null
    endAfterNoUpdate: boolean;
    shouldEndAcceleratedAt?: string | null; // ISO or null
}

export interface PlayerJoinedDto {
    matchmakingId: string;
    player: MatchmakingPlayerDto;
    playersCount: number;
    maxPlayers: number;
    // Legacy/compat: backend event keeps old name; use to compute requiredPlayersToMin when needed
    minRequiredPlayers?: number | null;
}

export interface PlayerLeftDto {
    matchmakingId: string;
    player: MatchmakingPlayerDto;
    playersCount: number;
    maxPlayers: number;
    minRequiredPlayers?: number | null;
}

export type MatchmakingStatus = 'Running' | 'Ended Succeeded' | 'Ended NotEnoughPlayers' | 'Failed' | string;


