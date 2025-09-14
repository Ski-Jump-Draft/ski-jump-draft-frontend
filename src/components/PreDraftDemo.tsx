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
    gate: {
        starting: 0,
        currentJury: 0,
        coachReduction: null
    },
    results: [],
    nextJumpInSeconds: 3,
    nextJumperId: 'j6' // Helper property from backend
};

// Mock data for demonstration
const mockGameData: GameUpdatedDto = {
    gameId: '123e4567-e89b-12d3-a456-426614174000',
    schemaVersion: 1,
    status: 'PreDraft',
    nextStatus: {
        status: 'Draft',
        in: 'PT2M30S'
    },
    changeType: 'Snapshot',
    preDraftsCount: 2,
    header: {
        hillId: 'hill-123',
        players: mockPlayers,
        jumpers: [
            { gameJumperId: 'j1', gameWorldJumperId: 'world-j1', name: 'Kamil', surname: 'STOCH', countryFisCode: 'POL', bib: 1 },
            { gameJumperId: 'j2', gameWorldJumperId: 'world-j2', name: 'Stephan', surname: 'EMBACHER', countryFisCode: 'AUT', bib: 2 },
            { gameJumperId: 'j3', gameWorldJumperId: 'world-j3', name: 'Ryoyu', surname: 'KOBAYASHI', countryFisCode: 'JPN', bib: 3 },
            { gameJumperId: 'j4', gameWorldJumperId: 'world-j4', name: 'Halvor', surname: 'EGNER GRANERUD', countryFisCode: 'NOR', bib: 4 },
            { gameJumperId: 'j5', gameWorldJumperId: 'world-j5', name: 'Karl', surname: 'GEIGER', countryFisCode: 'GER', bib: 5 },
            { gameJumperId: 'j6', gameWorldJumperId: 'world-j6', name: 'Piotr', surname: 'ŻYLA', countryFisCode: 'POL', bib: 6 },
            { gameJumperId: 'j7', gameWorldJumperId: 'world-j7', name: 'Dawid', surname: 'KUBACKI', countryFisCode: 'POL', bib: 7 },
            { gameJumperId: 'j8', gameWorldJumperId: 'world-j8', name: 'Anze', surname: 'LANISEK', countryFisCode: 'SLO', bib: 8 },
            { gameJumperId: 'j9', gameWorldJumperId: 'world-j9', name: 'Lovro', surname: 'KOS', countryFisCode: 'SLO', bib: 9 },
            { gameJumperId: 'j10', gameWorldJumperId: 'world-j10', name: 'Tim', surname: 'ZOGG', countryFisCode: 'SUI', bib: 10 },
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
        ]
    },
    preDraft: {
        mode: 'Running',
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
    { bib: 11, jumperId: 'j11', name: 'Manuel', surname: 'FETTNER', countryFisCode: 'AUT' },
    { bib: 12, jumperId: 'j12', name: 'Jan', surname: 'HÖRL', countryFisCode: 'AUT' },
    { bib: 13, jumperId: 'j13', name: 'Daniel', surname: 'TANDE', countryFisCode: 'NOR' },
    { bib: 14, jumperId: 'j14', name: 'Robert', surname: 'JOHANSSON', countryFisCode: 'NOR' },
    { bib: 15, jumperId: 'j15', name: 'Andreas', surname: 'WELLINGER', countryFisCode: 'GER' },
    { bib: 16, jumperId: 'j16', name: 'Constantin', surname: 'SCHMID', countryFisCode: 'GER' },
    { bib: 17, jumperId: 'j17', name: 'Paweł', surname: 'WĄSEK', countryFisCode: 'POL' },
    { bib: 18, jumperId: 'j18', name: 'Maciej', surname: 'KOT', countryFisCode: 'POL' },
    { bib: 19, jumperId: 'j19', name: 'Domen', surname: 'PREVC', countryFisCode: 'SLO' },
    { bib: 20, jumperId: 'j20', name: 'Peter', surname: 'PREVC', countryFisCode: 'SLO' },
    { bib: 21, jumperId: 'j21', name: 'Simon', surname: 'AMMANN', countryFisCode: 'SUI' },
    { bib: 22, jumperId: 'j22', name: 'Gregor', surname: 'SCHLIERENZAUER', countryFisCode: 'AUT' },
    { bib: 23, jumperId: 'j23', name: 'Johann', surname: 'FORFANG', countryFisCode: 'NOR' },
    { bib: 24, jumperId: 'j24', name: 'Marius', surname: 'LINDVIK', countryFisCode: 'NOR' },
    { bib: 25, jumperId: 'j25', name: 'Richard', surname: 'FREITAG', countryFisCode: 'GER' },
    { bib: 26, jumperId: 'j26', name: 'Markus', surname: 'EISENBICHLER', countryFisCode: 'GER' },
    { bib: 27, jumperId: 'j27', name: 'Severin', surname: 'FREUND', countryFisCode: 'GER' },
    { bib: 28, jumperId: 'j28', name: 'Stefan', surname: 'KRAFT', countryFisCode: 'AUT' },
    { bib: 29, jumperId: 'j29', name: 'Michael', surname: 'HAYBOECK', countryFisCode: 'AUT' },
    { bib: 30, jumperId: 'j30', name: 'Clemens', surname: 'AIGNER', countryFisCode: 'AUT' },
    { bib: 31, jumperId: 'j31', name: 'Yukiya', surname: 'SATO', countryFisCode: 'JPN' },
    { bib: 32, jumperId: 'j32', name: 'Daiki', surname: 'ITO', countryFisCode: 'JPN' },
    { bib: 33, jumperId: 'j33', name: 'Noriaki', surname: 'KASAI', countryFisCode: 'JPN' },
    { bib: 34, jumperId: 'j34', name: 'Jarl Magnus', surname: 'RIIBER', countryFisCode: 'NOR' },
    { bib: 35, jumperId: 'j35', name: 'Anders', surname: 'FANNEMEL', countryFisCode: 'NOR' },
    { bib: 36, jumperId: 'j36', name: 'Tom', surname: 'HILDE', countryFisCode: 'NOR' },
    { bib: 37, jumperId: 'j37', name: 'Jurij', surname: 'TEPES', countryFisCode: 'SLO' },
    { bib: 38, jumperId: 'j38', name: 'Ziga', surname: 'JELAR', countryFisCode: 'SLO' },
    { bib: 39, jumperId: 'j39', name: 'Bor', surname: 'PAVLIN', countryFisCode: 'SLO' },
    { bib: 40, jumperId: 'j40', name: 'Killian', surname: 'PEIER', countryFisCode: 'SUI' },
    { bib: 41, jumperId: 'j41', name: 'Gregor', surname: 'DESCHWANDEN', countryFisCode: 'SUI' },
    { bib: 42, jumperId: 'j42', name: 'Andreas', surname: 'SCHULER', countryFisCode: 'SUI' },
    { bib: 43, jumperId: 'j43', name: 'MacKenzie', surname: 'BOYD-CLOWES', countryFisCode: 'CAN' },
    { bib: 44, jumperId: 'j44', name: 'Dusty', surname: 'KOREAK', countryFisCode: 'CAN' },
    { bib: 45, jumperId: 'j45', name: 'Kevin', surname: 'BICKNER', countryFisCode: 'USA' },
    { bib: 46, jumperId: 'j46', name: 'Casey', surname: 'LARSON', countryFisCode: 'USA' },
    { bib: 47, jumperId: 'j47', name: 'Decker', surname: 'DEAN', countryFisCode: 'USA' },
    { bib: 48, jumperId: 'j48', name: 'Vladimir', surname: 'ZOGRAFSKI', countryFisCode: 'BUL' },
    { bib: 49, jumperId: 'j49', name: 'Andrei', surname: 'FELDMAN', countryFisCode: 'BUL' },
    { bib: 50, jumperId: 'j50', name: 'Timi', surname: 'ZAJEC', countryFisCode: 'SLO' },
];

const mockSessions: PreDraftSessionDto[] = [
    {
        sessionNumber: 1,
        isActive: false,
        results: [
            {
                rank: 1,
                bib: 1,
                competitionJumperId: 'comp-j1',
                total: 133.4,
                rounds: [{ gameJumperId: 'j1', competitionJumperId: 'comp-j1', distance: 138.5, points: 133.4, judges: [17.5, 17.5, 18.0, 18.0, 17.5], judgePoints: 53, windCompensation: -5.5, windAverage: 0.45, gateCompensation: 0, totalCompensation: -5.5 }]
            },
            {
                rank: 2,
                bib: 2,
                competitionJumperId: 'comp-j2',
                total: 120.1,
                rounds: [{ gameJumperId: 'j2', competitionJumperId: 'comp-j2', distance: 127.5, points: 120.1, judges: [17.5, 17.5, 18.0, 18.0, 17.5], judgePoints: 53, windCompensation: -5.5, windAverage: 0.45, gateCompensation: 0, totalCompensation: -5.5 }]
            },
            {
                rank: 3,
                bib: 3,
                competitionJumperId: 'comp-j3',
                total: 118.2,
                rounds: [{ gameJumperId: 'j3', competitionJumperId: 'comp-j3', distance: 125.0, points: 118.2, judges: [17.0, 17.0, 17.0, 17.0, 17.0], judgePoints: 51, windCompensation: -4.8, windAverage: 0.32, gateCompensation: 0, totalCompensation: -4.8 }]
            },
            {
                rank: 4,
                bib: 4,
                competitionJumperId: 'comp-j4',
                total: 115.8,
                rounds: [{ gameJumperId: 'j4', competitionJumperId: 'comp-j4', distance: 122.5, points: 115.8, judges: [16.5, 16.5, 16.0, 16.0, 16.5], judgePoints: 49, windCompensation: -3.2, windAverage: 0.25, gateCompensation: 0, totalCompensation: -3.2 }]
            },
            {
                rank: 5,
                bib: 5,
                competitionJumperId: 'comp-j5',
                total: 112.3,
                rounds: [{ gameJumperId: 'j5', competitionJumperId: 'comp-j5', distance: 120.0, points: 112.3, judges: [16.0, 15.5, 15.5, 16.0, 15.5], judgePoints: 47, windCompensation: -2.1, windAverage: 0.18, gateCompensation: 0, totalCompensation: -2.1 }]
            }
        ]
    },
    {
        sessionNumber: 2,
        isActive: true,
        nextJumpInSeconds: 3,
        results: [
            {
                rank: 1,
                bib: 6,
                competitionJumperId: 'comp-j6',
                total: 142.8,
                rounds: [{ gameJumperId: 'j6', competitionJumperId: 'comp-j6', distance: 145.0, points: 142.8, judges: [18.5, 18.5, 18.0, 18.5, 18.5], judgePoints: 55, windCompensation: 2.3, windAverage: -0.15, gateCompensation: 0, totalCompensation: 2.3 }]
            },
            {
                rank: 2,
                bib: 7,
                competitionJumperId: 'comp-j7',
                total: 138.5,
                rounds: [{ gameJumperId: 'j7', competitionJumperId: 'comp-j7', distance: 141.5, points: 138.5, judges: [18.0, 18.0, 18.0, 18.0, 18.0], judgePoints: 54, windCompensation: 1.8, windAverage: -0.12, gateCompensation: 0, totalCompensation: 1.8 }]
            },
            {
                rank: 3,
                bib: 8,
                competitionJumperId: 'comp-j8',
                total: 135.2,
                rounds: [{ gameJumperId: 'j8', competitionJumperId: 'comp-j8', distance: 139.0, points: 135.2, judges: [17.5, 17.0, 17.0, 17.5, 17.5], judgePoints: 52, windCompensation: 0.9, windAverage: -0.08, gateCompensation: 0, totalCompensation: 0.9 }]
            },
            {
                rank: 4,
                bib: 9,
                competitionJumperId: 'comp-j9',
                total: 128.7,
                rounds: [{ gameJumperId: 'j9', competitionJumperId: 'comp-j9', distance: 132.0, points: 128.7, judges: [17.0, 16.5, 16.5, 17.0, 17.0], judgePoints: 50, windCompensation: -1.2, windAverage: 0.08, gateCompensation: 0, totalCompensation: -1.2 }]
            },
            {
                rank: 5,
                bib: 10,
                competitionJumperId: 'comp-j10',
                total: 125.4,
                rounds: [{ gameJumperId: 'j10', competitionJumperId: 'comp-j10', distance: 129.5, points: 125.4, judges: [16.0, 16.0, 16.0, 16.0, 16.0], judgePoints: 48, windCompensation: -0.8, windAverage: 0.05, gateCompensation: 0, totalCompensation: -0.8 }]
            },
            {
                rank: 6,
                bib: 11,
                competitionJumperId: 'comp-j11',
                total: 122.1,
                rounds: [{ gameJumperId: 'j11', competitionJumperId: 'comp-j11', distance: 127.0, points: 122.1, judges: [15.5, 15.5, 15.0, 15.0, 15.5], judgePoints: 46, windCompensation: -0.3, windAverage: 0.02, gateCompensation: 0, totalCompensation: -0.3 }]
            },
            {
                rank: 7,
                bib: 12,
                competitionJumperId: 'comp-j12',
                total: 118.9,
                rounds: [{ gameJumperId: 'j12', competitionJumperId: 'comp-j12', distance: 124.5, points: 118.9, judges: [15.0, 14.5, 14.5, 15.0, 15.0], judgePoints: 44, windCompensation: 0.2, windAverage: -0.01, gateCompensation: 0, totalCompensation: 0.2 }]
            },
            {
                rank: 8,
                bib: 13,
                competitionJumperId: 'comp-j13',
                total: 115.6,
                rounds: [{ gameJumperId: 'j13', competitionJumperId: 'comp-j13', distance: 122.0, points: 115.6, judges: [14.5, 14.0, 14.0, 14.5, 14.5], judgePoints: 42, windCompensation: 0.7, windAverage: -0.04, gateCompensation: 0, totalCompensation: 0.7 }]
            },
            {
                rank: 9,
                bib: 14,
                competitionJumperId: 'comp-j14',
                total: 112.3,
                rounds: [{ gameJumperId: 'j14', competitionJumperId: 'comp-j14', distance: 119.5, points: 112.3, judges: [14.0, 13.5, 13.5, 14.0, 14.0], judgePoints: 40, windCompensation: 1.1, windAverage: -0.07, gateCompensation: 0, totalCompensation: 1.1 }]
            },
            {
                rank: 10,
                bib: 15,
                competitionJumperId: 'comp-j15',
                total: 109.0,
                rounds: [{ gameJumperId: 'j15', competitionJumperId: 'comp-j15', distance: 117.0, points: 109.0, judges: [13.5, 13.0, 13.0, 13.5, 13.5], judgePoints: 38, windCompensation: 1.5, windAverage: -0.10, gateCompensation: 0, totalCompensation: 1.5 }]
            },
            {
                rank: 11,
                bib: 16,
                competitionJumperId: 'comp-j16',
                total: 105.7,
                rounds: [{ gameJumperId: 'j16', competitionJumperId: 'comp-j16', distance: 114.5, points: 105.7, judges: [13.0, 12.5, 12.5, 13.0, 13.0], judgePoints: 36, windCompensation: 1.9, windAverage: -0.13, gateCompensation: 0, totalCompensation: 1.9 }]
            },
            {
                rank: 12,
                bib: 17,
                competitionJumperId: 'comp-j17',
                total: 102.4,
                rounds: [{ gameJumperId: 'j17', competitionJumperId: 'comp-j17', distance: 112.0, points: 102.4, judges: [12.5, 12.0, 12.0, 12.5, 12.5], judgePoints: 34, windCompensation: 2.3, windAverage: -0.16, gateCompensation: 0, totalCompensation: 2.3 }]
            },
            {
                rank: 13,
                bib: 18,
                competitionJumperId: 'comp-j18',
                total: 99.1,
                rounds: [{ gameJumperId: 'j18', competitionJumperId: 'comp-j18', distance: 109.5, points: 99.1, judges: [12.0, 11.5, 11.5, 12.0, 12.0], judgePoints: 32, windCompensation: 2.7, windAverage: -0.19, gateCompensation: 0, totalCompensation: 2.7 }]
            },
            {
                rank: 14,
                bib: 19,
                competitionJumperId: 'comp-j19',
                total: 95.8,
                rounds: [{ gameJumperId: 'j19', competitionJumperId: 'comp-j19', distance: 107.0, points: 95.8, judges: [11.5, 11.0, 11.0, 11.5, 11.5], judgePoints: 30, windCompensation: 3.1, windAverage: -0.22, gateCompensation: 0, totalCompensation: 3.1 }]
            },
            {
                rank: 15,
                bib: 20,
                competitionJumperId: 'comp-j20',
                total: 92.5,
                rounds: [{ gameJumperId: 'j20', competitionJumperId: 'comp-j20', distance: 104.5, points: 92.5, judges: [11.0, 10.5, 10.5, 11.0, 11.0], judgePoints: 28, windCompensation: 3.5, windAverage: -0.25, gateCompensation: 0, totalCompensation: 3.5 }]
            },
            {
                rank: 16,
                bib: 21,
                competitionJumperId: 'comp-j21',
                total: 89.2,
                rounds: [{ gameJumperId: 'j21', competitionJumperId: 'comp-j21', distance: 102.0, points: 89.2, judges: [10.5, 10.0, 10.0, 10.5, 10.5], judgePoints: 26, windCompensation: 3.9, windAverage: -0.28, gateCompensation: 0, totalCompensation: 3.9 }]
            },
            {
                rank: 17,
                bib: 22,
                competitionJumperId: 'comp-j22',
                total: 85.9,
                rounds: [{ gameJumperId: 'j22', competitionJumperId: 'comp-j22', distance: 99.5, points: 85.9, judges: [10.0, 9.5, 9.5, 10.0, 10.0], judgePoints: 24, windCompensation: 4.3, windAverage: -0.31, gateCompensation: 0, totalCompensation: 4.3 }]
            },
            {
                rank: 18,
                bib: 23,
                competitionJumperId: 'comp-j23',
                total: 82.6,
                rounds: [{ gameJumperId: 'j23', competitionJumperId: 'comp-j23', distance: 97.0, points: 82.6, judges: [9.5, 9.0, 9.0, 9.5, 9.5], judgePoints: 22, windCompensation: 4.7, windAverage: -0.34, gateCompensation: 0, totalCompensation: 4.7 }]
            },
            {
                rank: 19,
                bib: 24,
                competitionJumperId: 'comp-j24',
                total: 79.3,
                rounds: [{ gameJumperId: 'j24', competitionJumperId: 'comp-j24', distance: 94.5, points: 79.3, judges: [9.0, 8.5, 8.5, 9.0, 9.0], judgePoints: 20, windCompensation: 5.1, windAverage: -0.37, gateCompensation: 0, totalCompensation: 5.1 }]
            },
            {
                rank: 20,
                bib: 25,
                competitionJumperId: 'comp-j25',
                total: 76.0,
                rounds: [{ gameJumperId: 'j25', competitionJumperId: 'comp-j25', distance: 92.0, points: 76.0, judges: [8.5, 8.0, 8.0, 8.5, 8.5], judgePoints: 18, windCompensation: 5.5, windAverage: -0.40, gateCompensation: 0, totalCompensation: 5.5 }]
            }
        ]
    }
];

const mockCurrentJumperDetails: JumperDetailsDto = {
    gameJumperId: 'j9',
    competitionJumperId: 'comp-j9',
    name: 'Lovro',
    surname: 'KOS',
    countryFisCode: 'SLO',
    photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lovro',
    currentPosition: undefined, // Haven't jumped yet
    gatePoints: 0,
    windPoints: 0,
    totalCompensation: 0,
    totalScore: 0,
    lastJumpResult: undefined // No jump result yet
};

interface PreDraftDemoProps {
    onBack?: () => void;
}

export function PreDraftDemo({ onBack }: PreDraftDemoProps) {
    // Always show Stephan EMBACHER with completed results
    const currentJumper = {
        gameJumperId: 'j6',
        competitionJumperId: 'comp-j6',
        name: 'Piotr',
        surname: 'ŻYLA',
        countryFisCode: 'POL',
        photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Piotr',
        currentPosition: 3,
        gatePoints: 8.1,
        windPoints: -5.5,
        totalCompensation: 2.6,
        totalScore: 120.1,
        lastJumpResult: {
            gameJumperId: 'j6',
            competitionJumperId: 'comp-j6',
            distance: 130.5,
            points: 124,
            judges: [18.0, 18.0, 18.0, 18.0, 18.0],
            judgePoints: 54,
            windCompensation: -5,
            windAverage: 0.33,
            gateCompensation: 0,
            totalCompensation: -5
        }
    };

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