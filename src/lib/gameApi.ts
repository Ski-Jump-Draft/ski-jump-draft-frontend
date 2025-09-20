const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5150').replace(/\/$/, '');

export const pickJumper = async (gameId: string, playerId: string, jumperId: string): Promise<{ success: boolean; status: number }> => {
    try {
        const response = await fetch(`${API}/game/${gameId}/pick?playerId=${encodeURIComponent(playerId)}&jumperId=${encodeURIComponent(jumperId)}`, {
            method: 'POST',
        });

        if (response.ok) {
            return { success: true, status: response.status };
        } else {
            // Conflict (409) -> JumperTakenException
            // Forbidden (403) -> NotYourTurnException
            console.error(`Failed to pick jumper. Status: ${response.status}`);
            return { success: false, status: response.status };
        }
    } catch (error) {
        console.error("An error occurred while picking a jumper:", error);
        return { success: false, status: 500 }; // Internal Server Error
    }
};
