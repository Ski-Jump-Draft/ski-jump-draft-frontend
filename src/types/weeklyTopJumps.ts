export interface WeeklyTopJumpDto {
    GameId: string;
    GameCreatedAt: string;
    HillId: string;
    KPoint: number;
    HsPoint: number;
    CompetitionJumperId: string;
    GameJumperId: string;
    Distance: number;
    WindAverage: number;
    Gate: number;
    DraftPlayerNicks: string[];
}