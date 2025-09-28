// ───────── Root ─────────

export interface GameUpdatedDto {
    gameId: string;
    schemaVersion: number;
    status: GameStatus; // "PreDraft" | "Draft" | "MainCompetition" | "Ended" | "Break"
    nextStatus: NextStatusDto | null;
    changeType: string; // "Snapshot" | "PhaseChanged" | "DraftPickMade" | "JumpAdded" | ...
    preDraftsCount: number;
    header: GameHeaderDto;
    preDraft: PreDraftDto | null;
    endedPreDraft: EndedPreDraftDto | null;
    draft: DraftDto | null;
    mainCompetition: CompetitionDto | null;
    break: BreakDto | null;
    ended: EndedDto | null;
    lastCompetitionState: CompetitionDto | null;
    lastCompetitionResultDto?: CompetitionRoundResultDto | null;
}

// ───────── Header (stabilne słowniki referencyjne) ─────────

export interface GameHeaderDto {
    draftOrderPolicy: "Classic" | "Snake" | "Random";
    draftTimeoutInSeconds: number | null;
    hill: GameHillDto;
    players: GamePlayerDto[];
    jumpers: GameJumperDto[];
    competitionJumpers: CompetitionJumperDto[];
}

export interface GameHillDto {
    name: string;
    location: string;
    k: number;
    hs: number;
    countryFisCode: string;
    alpha2Code: string;
}

export interface GamePlayerDto {
    playerId: string;
    nick: string;
    isBot: boolean;
}

export interface GameJumperDto {
    gameJumperId: string;
    gameWorldJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

// ───────── Next Status ─────────

export interface NextStatusDto {
    status: string;
    in: string; // TimeSpan
}

// ───────── PreDraft ─────────

export interface EndedPreDraftDto {
    endedCompetitions: EndedCompetitionResults[];
}

export interface PreDraftDto {
    status: "Running" | "Break";
    index: number | null; // 0-based, can be null
    competition: CompetitionDto | null; // null if Break
}

// ───────── Draft ─────────

export interface DraftDto {
    currentPlayerId: string | null;
    timeoutInSeconds: number | null;
    ended: boolean;
    orderPolicy: "Classic" | "Snake" | "Random";
    picks: PlayerPicksDto[];
    availableJumpers: DraftPickOptionDto[];
    nextPlayers: string[];
}

export interface DraftPickOptionDto {
    gameJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
    trainingRanks: number[];
}

export interface PlayerPicksDto {
    playerId: string;
    jumperIds: string[];
}

// ───────── Competition (lekki widok) ─────────

export interface CompetitionDto {
    status: CompetitionStatus; // "NotStarted" | "RoundInProgress" | "Suspended" | "Cancelled" | "Ended"
    roundIndex: number | null;
    startlist: StartlistJumperDto[];
    gateState: GateStateDto;
    results: CompetitionResultDto[];
    nextJumpInMilliseconds: number | null;
    nextJumperId?: string | null; // Helper property
}

export interface EndedCompetitionResults {
    results: CompetitionResultDto[];
}

export interface StartlistJumperDto {
    bib: number;
    done: boolean;
    competitionJumperId: string;
}

export interface CompetitionResultDto {
    rank: number;
    bib: number;
    competitionJumperId: string;
    total: number;
    rounds: CompetitionRoundResultDto[];
}

export interface CompetitionRoundResultDto {
    gameJumperId: string;
    competitionJumperId: string;
    distance: number;
    points: number;
    judges?: number[] | null;
    judgePoints?: number | null;
    windCompensation?: number | null;
    windAverage: number;
    gate: number;
    gateCompensation?: number | null;
    totalCompensation: number;
}

export interface CompetitionJumperDto {
    gameJumperId: string;
    competitionJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

export interface GateStateDto {
    starting: number;
    currentJury: number;
    coachReduction: number | null;
}

// ───────── Break / Ended ─────────

export interface BreakDto {
    next: "PreDraft" | "Draft" | "MainCompetition" | "Ended";
    draftOrderPolicy?: "Classic" | "Snake" | "Random";
}

export interface EndedDto {
    policy: "Classic" | "PodiumAtAllCosts";
    ranking: Record<string, PositionAndPoints>; // position, points
}

export interface PositionAndPoints {
    position: number;
    points: number;
}

// ───────── Utility Types ─────────

export interface StartlistEntryDto {
    bib: number;
    jumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

export interface PlayerWithBotFlagDto {
    playerId: string;
    nick: string;
    isBot: boolean;
}

export interface JumperDetailsDto {
    gameJumperId: string;
    competitionJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
    photoUrl: string;
    lastJumpResult: CompetitionRoundResultDto;
    currentPosition?: number;
    gatePoints?: number;
    windPoints?: number;
    totalCompensation?: number;
    totalScore: number;
}

export interface PreDraftSessionDto {
    sessionNumber: number;
    results: CompetitionResultDto[];
    isActive: boolean;
    nextJumpInMilliseconds?: number;
}

// Typy pomocnicze, które mogą być przestarzałe
export type GameStatus = "PreDraft" | "Draft" | "MainCompetition" | "Ended" | "Break" | "Break Draft" | "Break MainCompetition" | "Break Ended" | "Break PreDraft";
export type CompetitionStatus = "NotStarted" | "RoundInProgress" | "Suspended" | "Cancelled" | "Ended";