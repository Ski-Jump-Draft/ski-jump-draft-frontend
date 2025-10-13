import { MatchmakingUpdatedDto } from '@/types/matchmaking';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5150').replace(/\/$/, '');

export interface JoinResponse {
    matchmakingId: string;
    correctedNick: string;
    playerId: string;
}

export interface MatchmakingSnapshot {
    status: string;
    failReason?: string | null;
    playersCount: number;
    requiredPlayersToMin?: number | null; // renamed from MinRequiredPlayers
    minPlayers: number;
    maxPlayers: number;
    players?: {
        playerId: string;
        nick: string;
        isBot: boolean;
    }[];
    startedAt?: string | null;
    forceEndAt?: string | null; // ISO end deadline
    endedAt?: string | null;
    shouldEndAcceleratedAt?: string | null;
}

export interface GameStartedResponse {
    matchmakingId: string;
    gameId: string;
    playersMapping: Record<string, string>; // matchmakingPlayerId -> gamePlayerId
}

export async function getMatchmaking(matchmakingId: string): Promise<MatchmakingUpdatedDto> {
    const res = await fetch(`${API}/matchmaking?matchmakingId=${matchmakingId}`);
    if (!res.ok) {
        throw new Error(`get matchmaking failed: ${res.statusText}`);
    }
    const result = await res.json();
    return result.matchmakingUpdatedDto;
}

export interface JoinError {
    error: 'MultipleGamesNotSupported' | 'AlreadyJoined' | 'RoomIsFull' | 'InvalidPasswordException' | 'PrivateServerInUse' | 'ServerError';
    message: string;
}

export async function joinMatchmaking(nick: string): Promise<JoinResponse> {
    const res = await fetch(`${API}/matchmaking/join?nick=${encodeURIComponent(nick)}`, { method: 'POST' });

    if (!res.ok) {
        if (res.status === 409) {
            // Conflict - specific error from backend
            const errorData = await res.json();
            const error: JoinError = {
                error: errorData.error || 'ServerError',
                message: errorData.message || 'Wystąpił błąd podczas dołączania'
            };
            throw error;
        } else {
            // Other HTTP errors
            const error: JoinError = {
                error: 'ServerError',
                message: `Błąd serwera: ${res.statusText}`
            };
            throw error;
        }
    }

    const d = await res.json();
    return {
        matchmakingId: d.matchmakingId,
        correctedNick: d.correctedNick,
        playerId: d.playerId,
    };
}

export async function joinPremiumMatchmaking(nick: string, password: string): Promise<JoinResponse> {
    const res = await fetch(`${API}/matchmaking/joinPremium?nick=${encodeURIComponent(nick)}&password=${encodeURIComponent(password)}`, {
        method: 'POST'
    });

    if (!res.ok) {
        if (res.status === 409) {
            // Conflict - specific error from backend
            const errorData = await res.json();
            const error: JoinError = {
                error: errorData.error || 'ServerError',
                message: errorData.message || 'Wystąpił błąd podczas dołączania'
            };
            throw error;
        } else {
            // Other HTTP errors
            const error: JoinError = {
                error: 'ServerError',
                message: `Błąd serwera: ${res.statusText}`
            };
            throw error;
        }
    }

    const d = await res.json();
    return {
        matchmakingId: d.matchmakingId,
        correctedNick: d.correctedNick,
        playerId: d.playerId,
    };
}

export async function leaveMatchmaking(gameId: string, participantId: string): Promise<void> {
    const url = `${API}/matchmaking/leave?matchmakingId=${encodeURIComponent(gameId)}&playerId=${encodeURIComponent(participantId)}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`leave failed: ${res.statusText}`);
}

// ───────── Game API ─────────
export async function leaveGame(gameId: string, playerId: string): Promise<{ hasLeft: boolean }> {
    const url = `${API}/game/${encodeURIComponent(gameId)}/leave?playerId=${encodeURIComponent(playerId)}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        if (res.status === 404) {
            return { hasLeft: false };
        }
        throw new Error(`leave game failed: ${res.statusText}`);
    }
    return res.json();
}

export async function pickJumper(gameId: string, playerId: string, jumperId: string): Promise<void> {
    const url = `${API}/game/${encodeURIComponent(gameId)}/pick?playerId=${encodeURIComponent(playerId)}&jumperId=${encodeURIComponent(jumperId)}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
        if (res.status === 409) {
            throw new Error('JUMPER_TAKEN');
        }
        if (res.status === 403) {
            throw new Error('NOT_YOUR_TURN');
        }
        throw new Error(`pick jumper failed: ${res.statusText}`);
    }
}
