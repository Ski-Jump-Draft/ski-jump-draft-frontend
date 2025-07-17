export interface JoinResponse {
    gameId: string;
    participantId: string;
    currentPlayers: number;
    maxPlayers: number;
}

const API =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5043';

export async function joinMatchmaking(nick: string): Promise<JoinResponse> {
    const res = await fetch(`${API}/game/joinMatchmaking`, {
        method: 'POST',
        body: JSON.stringify({ nick }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`start matchmaking failed: ${res.statusText}`);
    }

    const data = await res.json();

    return {
        gameId: data.matchmakingId,
        participantId: data.matchmakingParticipantId,
        currentPlayers: 1,
        maxPlayers: 6,
    };
}

export async function quitMatchmaking(gameId: string, participantId: string): Promise<void> {
    const res = await fetch(`${API}/game/leaveMatchmaking`, {
        method: 'POST',
        body: JSON.stringify({ gameId, participantId }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`quit matchmaking failed: ${res.statusText}`);
    }
}
