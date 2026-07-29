import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARE = 4;

export type CompareEntry = {
    cid: string;
    primary_image_url: string | null;
};

type CompareState = {
    items: CompareEntry[];
    showLimitWarning: boolean;
    add: (entry: CompareEntry) => void;
    remove: (cid: string) => void;
    clear: () => void;
    has: (cid: string) => boolean;
};

type PersistedCompareV1 = {
    cids?: string[];
    items?: CompareEntry[];
    showLimitWarning?: boolean;
};

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],
            showLimitWarning: false,

            add: (entry) => {
                const { items } = get();
                if (items.some((item) => item.cid === entry.cid)) return;

                if (items.length >= MAX_COMPARE) {
                    set({ showLimitWarning: true });
                    setTimeout(() => set({ showLimitWarning: false }), 2500);
                    return;
                }

                set({
                    items: [...items, { cid: entry.cid, primary_image_url: entry.primary_image_url ?? null }],
                    showLimitWarning: false,
                });
            },

            remove: (cid) => set({ items: get().items.filter((item) => item.cid !== cid) }),

            clear: () => set({ items: [] }),

            has: (cid) => get().items.some((item) => item.cid === cid),
        }),
        {
            name: "electricity:compare",
            version: 2,
            partialize: (state) => ({ items: state.items }),
            migrate: (persisted, version) => {
                const state = (persisted ?? {}) as PersistedCompareV1;

                if (version < 2) {
                    const fromCids = (state.cids ?? []).map((cid) => ({
                        cid: String(cid),
                        primary_image_url: null as string | null,
                    }));
                    return {
                        items: state.items?.length ? state.items : fromCids,
                    };
                }

                return {
                    items: state.items ?? [],
                };
            },
        }
    )
);
