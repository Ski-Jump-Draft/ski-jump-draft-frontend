export interface JoinResponse {
    gameId: string;
    participantId: string;
    currentPlayers: number;
    maxPlayers: number;
}

const API =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5043';

export async function joinMatchmaking(nick: string): Promise<JoinResponse> {
    const res = await fetch(`${API}/game/join`, {
        method: 'POST',
        body: JSON.stringify({ nick }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!res.ok) {
        throw new Error(`start matchmaking failed: ${res.statusText}`);
    }

    return (await res.json()) as JoinResponse;
}

export async function quitMatchmaking(
    gameId: string,
    participantId: string,
): Promise<void> {
    const res = await fetch(`${API}/game/leave`, {
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
