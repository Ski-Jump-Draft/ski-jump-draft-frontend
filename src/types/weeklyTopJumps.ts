export interface WeeklyTopJumpDto {
    gameId: string;
    gameCreatedAt: string;
    hillId: string;
    kPoint: number;
    hsPoint: number;
    hillLocation: string;
    hillCountryCode: string;
    competitionJumperId: string;
    gameWorldJumperId: string;
    name: string;
    surname: string;
    countryCode: string;
    distance: number;
    windAverage: number;
    gate: number;
    draftPlayerNicks: string[];
}