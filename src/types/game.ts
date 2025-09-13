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
}

export interface NextStatusDto {
    status: string;
    in: string; // TimeSpan as string from backend
}

export type GameStatus = "PreDraft" | "Draft" | "MainCompetition" | "Ended" | "Break";

// ───────── Header (stabilne słowniki referencyjne) ─────────
export interface GameHeaderDto {
    hillId: string | null;
    players: PlayerDto[];
    jumpers: JumperDto[];
}

export interface PlayerDto {
    playerId: string;
    nick: string;
}

export interface JumperDto {
    jumperId: string;
}

// ───────── PreDraft ─────────
export interface PreDraftDto {
    mode: "Running" | "Break";
    index: number; // 0-based index aktualnego/polskiego konkursu pre-draft
    competition: CompetitionDto | null; // null, jeśli Break
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
    nextJumperId: string | null;
    gate: GateDto;
    results: CompetitionResultDto[];
}

export type CompetitionStatus = "NotStarted" | "RoundInProgress" | "Suspended" | "Cancelled" | "Ended";

export interface CompetitionResultDto {
    rank: number;
    bib: number;
    jumper: CompetitionJumperDto;
    total: number;
    rounds: CompetitionRoundResultDto[];
}

export interface CompetitionRoundResultDto {
    distance: number;
    points: number;
    judgePoints: number | null;
    windPoints: number | null;
    windAverage: number | null;
}

export interface CompetitionJumperDto {
    id: string;
    name: string;
    surname: string;
    countryFisCode: string;
}

export interface GateDto {
    starting: number;
    currentJury: number;
    coachReduction: number | null;
}

// ───────── Break / Ended ─────────
export interface BreakDto {
    next: "PreDraft" | "Draft" | "MainCompetition" | "Ended";
}

export interface EndedDto {
    policy: "Classic" | "PodiumAtAllCosts";
    ranking: Record<string, [number, number]>; // position, points
}

// ───────── Legacy Hill interface (for backward compatibility) ─────────
export interface Hill {
    id: string;
    location: string;
    k: number;
    hs: number;
    countryCode: string;
}
