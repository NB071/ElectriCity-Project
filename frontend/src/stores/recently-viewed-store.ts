import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT = 8;

type RecentlyViewedState = {
    cids: string[];
    lastViewedId: string | null;
    track: (cid: string) => void;
    clear: () => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            cids: [],
            lastViewedId: null,

            track: (cid) => {
                const next = [cid, ...get().cids.filter((id) => id !== cid)].slice(0, MAX_RECENT);
                set({ cids: next, lastViewedId: cid });
            },

            clear: () => set({ cids: [], lastViewedId: null }),
        }),
        { name: "electricity:recently-viewed" }
    )
);
