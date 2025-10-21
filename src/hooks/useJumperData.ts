import { create } from 'zustand';

interface Jumper {
    id: string;
    name: string;
    nationality: string;
    photoUrl?: string;
}

interface JumperStore {
    jumpers: Map<string, Jumper>;
    setJumpers: (jumpers: Jumper[]) => void;
    getJumperById: (id: string) => Jumper | undefined;
}

export const useJumperData = create<JumperStore>((set, get) => ({
    jumpers: new Map(),
    setJumpers: (jumpers: Jumper[]) => {
        const jumperMap = new Map<string, Jumper>();
        jumpers.forEach((jumper: Jumper) => {
            jumperMap.set(jumper.id, jumper);
        });
        set({ jumpers: jumperMap });
    },
    getJumperById: (id: string) => {
        return get().jumpers.get(id);
    },
}));