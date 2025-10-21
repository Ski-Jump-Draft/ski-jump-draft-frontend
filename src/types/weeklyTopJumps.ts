export interface WeeklyTopJumpDto {
    GameId: string;
    GameCreatedAt: string;
    HillId: string;
    KPoint: number;
    HsPoint: number;
    CompetitionJumperId: string;
    GameWorldJumperId: string;
    Name: string;
    Surname: string;
    CountryCode: string;
    Distance: number;
    WindAverage: number;
    Gate: number;
    DraftPlayerNicks: string[];
}