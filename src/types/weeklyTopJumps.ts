export interface WeeklyTopJumpDto {
    GameId: string;
    GameCreatedAt: string;
    HillId: string;
    KPoint: number;
    HsPoint: number;
    HillLocation: string;
    HillCountryCode: string;
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