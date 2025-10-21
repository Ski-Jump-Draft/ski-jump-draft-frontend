import { WeeklyTopJumpDto } from "@/types/weeklyTopJumps";

export async function getWeeklyTopJumps(): Promise<WeeklyTopJumpDto[]> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/rankings/weekly-top-jumps`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weekly top jumps");
    }

    return response.json();
}