import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARE = 4;

type CompareState = {
    cids: string[];
    showLimitWarning: boolean;
    add: (cid: string) => void;
    remove: (cid: string) => void;
    clear: () => void;
    has: (cid: string) => boolean;
};

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            cids: [],
            showLimitWarning: false,

            add: (cid) => {
                const { cids } = get();
                if (cids.includes(cid)) return;

                if (cids.length >= MAX_COMPARE) {
                    set({ showLimitWarning: true });
                    setTimeout(() => set({ showLimitWarning: false }), 2500);
                    return;
                }

                set({ cids: [...cids, cid], showLimitWarning: false });
            },

            remove: (cid) => set({ cids: get().cids.filter((id) => id !== cid) }),

            clear: () => set({ cids: [] }),

            has: (cid) => get().cids.includes(cid),
        }),
        { name: "electricity:compare" }
    )
);
