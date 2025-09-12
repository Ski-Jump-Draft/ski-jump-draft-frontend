export interface JoinResponse {
    matchmakingId: string;
    correctedNick: string;
    playerId: string;
}

export interface MatchmakingSnapshot {
    status: string;
    failReason?: string | null;
    playersCount: number;
    minRequiredPlayers?: number | null;
    minPlayers: number;
    maxPlayers: number;
    remainingTime?: string | null; // przyjdzie z backendu jako ISO albo "00:01:59"
}

export async function getMatchmaking(matchmakingId: string): Promise<MatchmakingSnapshot> {
    const res = await fetch(`${API}/matchmaking?matchmakingId=${matchmakingId}`);
    if (!res.ok) {
        throw new Error(`get matchmaking failed: ${res.statusText}`);
    }
    return res.json();
}

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5150').replace(/\/$/, '');

export async function joinMatchmaking(nick: string): Promise<JoinResponse> {
    const res = await fetch(`${API}/matchmaking/join?nick=${encodeURIComponent(nick)}`, { method: 'POST' });
    if (!res.ok) throw new Error(`join failed: ${res.statusText}`);
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
