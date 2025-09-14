// types/game.ts

// ───────── Root Game DTO ─────────
export interface GameUpdatedDto {
    gameId: string;
    schemaVersion: number;
    status: GameStatus; // "PreDraft" | "Draft" | "MainCompetition" | "Ended" | "Break"
    nextStatus: NextStatusDto | null;
    changeType: string; // "Snapshot" | "PhaseChanged" | "DraftPickMade" | "JumpAdded" | ...
    preDraftsCount: number;
    header: GameHeaderDto;
    preDraft: PreDraftDto | null;
    draft: DraftDto | null;
    mainCompetition: CompetitionDto | null;
    break: BreakDto | null;
    ended: EndedDto | null;
    lastCompetitionState: CompetitionDto | null;
    lastCompetitionResultDto?: CompetitionRoundResultDto | null;
}

export interface NextStatusDto {
    status: string;
    in: string; // TimeSpan as string from backend
}

export type GameStatus = "PreDraft" | "Draft" | "MainCompetition" | "Ended" | "Break";

// ───────── Header (stabilne słowniki referencyjne) ─────────
export interface GameHeaderDto {
    hillId: string | null;
    players: GamePlayerDto[];
    jumpers: JumperDto[];
    competitionJumpers: CompetitionJumperDto[];
}

export interface PlayerDto {
    playerId: string;
    nick: string;
}

export interface GamePlayerDto {
    playerId: string;
    nick: string;
    isBot: boolean;
}

export interface JumperDto {
    gameJumperId: string;
    gameWorldJumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
    bib?: number;
}

// ───────── Draft ─────────
export interface DraftDto {
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
    startlist: StartlistJumperDto[];
    gate: GateDto;
    results: CompetitionResultDto[];
    nextJumpInSeconds?: number | null;
    nextJumperId?: string | null; // Helper property from backend
}

export type CompetitionStatus = "NotStarted" | "RoundInProgress" | "Suspended" | "Cancelled" | "Ended";

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
    gameJumperId: string; // NEW: Game jumper ID
    competitionJumperId: string; // NEW: Competition jumper ID
    distance: number;
    points: number;
    judges?: number[] | null;
    judgePoints?: number | null;
    windCompensation?: number | null;
    windAverage: number;
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

export interface GateDto {
    starting: number;
    currentJury: number;
    coachReduction: number | null;
}

// ───────── PreDraft ─────────
export interface PreDraftDto {
    mode: "Waiting" | "Running";
    index: number; // 0-based session index
    competition: CompetitionDto | null;
}

export interface StartlistEntryDto {
    bib: number;
    jumperId: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

export interface PlayerWithBotFlagDto extends PlayerDto {
    isBot: boolean;
}

export interface JumperDetailsDto extends CompetitionJumperDto {
    photoUrl?: string;
    lastJumpResult?: CompetitionRoundResultDto;
    currentPosition?: number;
    gatePoints?: number;
    windPoints?: number;
    totalCompensation?: number;
    totalScore?: number;
}

export interface PreDraftSessionDto {
    sessionNumber: number;
    results: CompetitionResultDto[];
    isActive: boolean;
    nextJumpInSeconds?: number;
}

// ───────── Break ─────────
export interface BreakDto {
    type: string;
    durationInSeconds: number;
    remainingInSeconds: number;
}

// ───────── Ended ─────────
export interface EndedDto {
    finalResults: CompetitionResultDto[];
    winner: CompetitionJumperDto;
}