// utils/nickname.ts
// PRZYMIOTNIKI
export const adjectivesMasc = [
    'Skaczący', 'Błyskawiczny', 'Szybki', 'Zwycięski',
    'Niepowstrzymany', 'Mocarny', 'Ostry', 'Zwinny',
    'Piorunujący', 'Lotny', 'Potężny', 'Gromowy',
    'Sokoli', 'Mistrzowski', 'Niezłomny', 'Brawurowy',
    'Turbo', 'Gigantyczny', 'Energetyczny', 'Walcowniczy',
];

export const adjectivesFem = [
    'Skacząca', 'Błyskawiczna', 'Szybka', 'Zwycięska',
    'Niepowstrzymana', 'Mocarna', 'Ostra', 'Zwinna',
    'Piorunująca', 'Lotna', 'Potężna', 'Gromowa',
    'Sokola', 'Mistrzowska', 'Niezłomna', 'Brawurowa',
    'Turbo', 'Gigantyczna', 'Energetyczna', 'Walcownicza',
];

// RZECZOWNIKI z natywnym rodzajem
export const nounsMasc = [
    'Wilk', 'Orzeł', 'Tygrys', 'Smok', 'Ninja',
    'Tytan', 'Mistrz', 'Lotnik', 'Rycerz', 'Snajper',
    'Grom', 'Huragan', 'Promień', 'Spartanin', 'Rakiet',
    'Dynamo', 'Koloss', 'Gladiator', 'Feniks', 'Bohater',
];

export const nounsFem = [
    'Panda', 'Jaskółka', 'Wróżka', 'Amazonka', 'Aretuzja',
    'Gwiazda', 'Legenda', 'Strzała', 'Iskierka', 'Skrzydło',
    'Błyskawica', 'Wirtuozka', 'Tornado', 'Tarcza', 'Tytanka',
    'Gwiazdeczka', 'Iskra', 'Perła', 'Aura', 'Melodia',
];

export function generateNickname(): string {
    const useFem = Math.random() < 0.5;

    if (useFem) {
        const noun = nounsFem[Math.floor(Math.random() * nounsFem.length)];
        const adjective = adjectivesFem[Math.floor(Math.random() * adjectivesFem.length)];
        return `${adjective}${noun}`;
    } else {
        const noun = nounsMasc[Math.floor(Math.random() * nounsMasc.length)];
        const adjective = adjectivesMasc[Math.floor(Math.random() * adjectivesMasc.length)];
        return `${adjective}${noun}`;
    }
}

