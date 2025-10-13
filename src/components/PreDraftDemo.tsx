'use client';

import { PreDraftScreen } from './PreDraftScreen';
import { GameUpdatedDto, StartlistEntryDto, PlayerWithBotFlagDto, JumperDetailsDto, PreDraftSessionDto } from '@/types/game';

const mockPlayers: PlayerWithBotFlagDto[] = [
    { playerId: 'p1', nick: 'Bot #6', isBot: true },
    { playerId: 'p2', nick: 'Bot #133', isBot: true },
    { playerId: 'p3', nick: 'Siekam Cebulę', isBot: false },
    { playerId: 'p4', nick: 'Jezus Chrystus', isBot: false },
];

// Mock CompetitionDto with startlist
const mockCompetition = {
    status: 'RoundInProgress' as const,
    roundIndex: 1,
    startlist: [
        { bib: 1, done: true, competitionJumperId: 'comp-j1' },
        { bib: 2, done: true, competitionJumperId: 'comp-j2' },
        { bib: 3, done: true, competitionJumperId: 'comp-j3' },
        { bib: 4, done: true, competitionJumperId: 'comp-j4' },
        { bib: 5, done: true, competitionJumperId: 'comp-j5' },
        { bib: 6, done: false, competitionJumperId: 'comp-j6' }, // Next jumper
        { bib: 7, done: false, competitionJumperId: 'comp-j7' },
        { bib: 8, done: false, competitionJumperId: 'comp-j8' },
        { bib: 9, done: false, competitionJumperId: 'comp-j9' },
        { bib: 10, done: false, competitionJumperId: 'comp-j10' },
    ],
    gateState: { starting: 0, currentJury: 0, coachReduction: null },
    results: [],
    nextJumpInMilliseconds: 3000,
    toBeatDistance: 138.5,
    nextJumperId: 'comp-j6' // Use competitionJumperId as in types
};

// Mock data for demonstration
const mockGameData: GameUpdatedDto = {
    gameId: '123e4567-e89b-12d3-a456-426614174000',
    schemaVersion: 1,
    status: 'PreDraft',
    nextStatus: {
        status: 'Draft',
        in: '00:02:30'
    },
    changeType: 'Snapshot',
    preDraftsCount: 2,
    endedPreDraft: null,
    header: {
        hill: {
            name: 'Wielka Krokiew',
            location: 'Zakopane',
            k: 125,
            hs: 140,
            countryFisCode: 'POL',
            alpha2Code: 'pl'
        },
        players: mockPlayers,
        jumpers: [
            { gameJumperId: 'j1', gameWorldJumperId: 'world-j1', name: 'Kamil', surname: 'STOCH', countryFisCode: 'POL' },
            { gameJumperId: 'j2', gameWorldJumperId: 'world-j2', name: 'Stephan', surname: 'EMBACHER', countryFisCode: 'AUT' },
            { gameJumperId: 'j3', gameWorldJumperId: 'world-j3', name: 'Ryoyu', surname: 'KOBAYASHI', countryFisCode: 'JPN' },
            { gameJumperId: 'j4', gameWorldJumperId: 'world-j4', name: 'Halvor', surname: 'EGNER GRANERUD', countryFisCode: 'NOR' },
            { gameJumperId: 'j5', gameWorldJumperId: 'world-j5', name: 'Karl', surname: 'GEIGER', countryFisCode: 'GER' },
            { gameJumperId: 'j6', gameWorldJumperId: 'world-j6', name: 'Piotr', surname: 'ŻYLA', countryFisCode: 'POL' },
            { gameJumperId: 'j7', gameWorldJumperId: 'world-j7', name: 'Dawid', surname: 'KUBACKI', countryFisCode: 'POL' },
            { gameJumperId: 'j8', gameWorldJumperId: 'world-j8', name: 'Anze', surname: 'LANISEK', countryFisCode: 'SLO' },
            { gameJumperId: 'j9', gameWorldJumperId: 'world-j9', name: 'Lovro', surname: 'KOS', countryFisCode: 'SLO' },
            { gameJumperId: 'j10', gameWorldJumperId: 'world-j10', name: 'Tim', surname: 'ZOGG', countryFisCode: 'SUI' },
        ],
        competitionJumpers: [
            { gameJumperId: 'j1', competitionJumperId: 'comp-j1', name: 'Kamil', surname: 'STOCH', countryFisCode: 'POL' },
            { gameJumperId: 'j2', competitionJumperId: 'comp-j2', name: 'Stefan', surname: 'KRAFT', countryFisCode: 'AUT' },
            { gameJumperId: 'j3', competitionJumperId: 'comp-j3', name: 'Ryoyu', surname: 'KOBAYASHI', countryFisCode: 'JPN' },
            { gameJumperId: 'j4', competitionJumperId: 'comp-j4', name: 'Halvor', surname: 'EGNER GRANERUD', countryFisCode: 'NOR' },
            { gameJumperId: 'j5', competitionJumperId: 'comp-j5', name: 'Karl', surname: 'GEIGER', countryFisCode: 'GER' },
            { gameJumperId: 'j6', competitionJumperId: 'comp-j6', name: 'Piotr', surname: 'ŻYLA', countryFisCode: 'POL' },
            { gameJumperId: 'j7', competitionJumperId: 'comp-j7', name: 'Dawid', surname: 'KUBACKI', countryFisCode: 'POL' },
            { gameJumperId: 'j8', competitionJumperId: 'comp-j8', name: 'Anze', surname: 'LANISEK', countryFisCode: 'SLO' },
            { gameJumperId: 'j9', competitionJumperId: 'comp-j9', name: 'Lovro', surname: 'KOS', countryFisCode: 'SLO' },
            { gameJumperId: 'j10', competitionJumperId: 'comp-j10', name: 'Tim', surname: 'ZOGG', countryFisCode: 'SUI' },
        ],
        draftOrderPolicy: 'Classic',
        draftTimeoutInSeconds: 30,
        draftPicksCount: 5,
        rankingPolicy: 'Classic',
    },
    preDraft: {
        status: 'Running',
        index: 1, // 0-based, so this is session 2
        competition: mockCompetition
    },
    draft: null,
    mainCompetition: null,
    break: null,
    ended: null,
    lastCompetitionState: null
};

const mockStartlist: StartlistEntryDto[] = [
    { bib: 1, jumperId: 'j1', name: 'Kamil', surname: 'STOCH', countryFisCode: 'POL' },
    { bib: 2, jumperId: 'j2', name: 'Stephan', surname: 'EMBACHER', countryFisCode: 'AUT' },
    { bib: 3, jumperId: 'j3', name: 'Ryoyu', surname: 'KOBAYASHI', countryFisCode: 'JPN' },
    { bib: 4, jumperId: 'j4', name: 'Halvor', surname: 'EGNER GRANERUD', countryFisCode: 'NOR' },
    { bib: 5, jumperId: 'j5', name: 'Karl', surname: 'GEIGER', countryFisCode: 'GER' },
    { bib: 6, jumperId: 'j6', name: 'Piotr', surname: 'ŻYLA', countryFisCode: 'POL' },
    { bib: 7, jumperId: 'j7', name: 'Dawid', surname: 'KUBACKI', countryFisCode: 'POL' },
    { bib: 8, jumperId: 'j8', name: 'Anze', surname: 'LANISEK', countryFisCode: 'SLO' },
    { bib: 9, jumperId: 'j9', name: 'Lovro', surname: 'KOS', countryFisCode: 'SLO' },
    { bib: 10, jumperId: 'j10', name: 'Tim', surname: 'ZOGG', countryFisCode: 'SUI' },
];

const mockSessions: PreDraftSessionDto[] = [
    {
        sessionNumber: 1,
        isActive: false,
        results: []
    },
    {
        sessionNumber: 2,
        isActive: true,
        nextJumpInMilliseconds: 3000,
        results: []
    }
];

const mockCurrentJumperDetails: JumperDetailsDto = {
    gameJumperId: 'j9',
    competitionJumperId: 'comp-j9',
    name: 'Lovro',
    surname: 'KOS',
    countryFisCode: 'SLO',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lovro',
    currentPosition: 3,
    gatePoints: 0,
    windPoints: 0,
    totalCompensation: 0,
    totalScore: 120.1,
    lastJumpResult: {
        gameJumperId: 'j9',
        competitionJumperId: 'comp-j9',
        distance: 132.0,
        points: 125.0,
        judges: [18, 18, 18, 18, 18],
        judgePoints: 54,
        windCompensation: -2.0,
        windAverage: 0.1,
        gate: 0,
        gateCompensation: 0,
        totalCompensation: -5.0
    }
};

interface PreDraftDemoProps {
    onBack?: () => void;
}

export function PreDraftDemo({ onBack }: PreDraftDemoProps) {
    const currentJumper = mockCurrentJumperDetails;

    return (
        <div className="fixed inset-0 z-50">
            {onBack && (
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={onBack}
                        className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-foreground hover:bg-muted transition-colors"
                    >
                        ← Powrót
                    </button>
                </div>
            )}
            <PreDraftScreen
                gameData={mockGameData}
                startlist={mockStartlist}
                players={mockPlayers}
                sessions={mockSessions}
                currentJumperDetails={currentJumper}
                nextJumpInSeconds={3}
                jumpersRemainingInSession={14}
            />
        </div>
    );
}