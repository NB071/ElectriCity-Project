import { create } from "zustand";
import { type BrowseCatalogFilters, type SortValue } from "@/zod/browse-catalog";

interface CatalogState {
    filters: Partial<BrowseCatalogFilters>;
    setFilters: (filters: Partial<BrowseCatalogFilters>) => void;
    updateFilter: <K extends keyof BrowseCatalogFilters>(key: K, value: BrowseCatalogFilters[K] | undefined) => void;
    clearFilters: () => void;
    setSort: (sort: SortValue) => void;
    resetStore: () => void;
}

const initialFilters: Partial<BrowseCatalogFilters> = {
    sort: "added_desc",
};

function mergeFilters(
    current: Partial<BrowseCatalogFilters>,
    patch: Partial<BrowseCatalogFilters>
): Partial<BrowseCatalogFilters> {
    const next: Record<string, unknown> = { ...current };

    for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") {
            delete next[key];
        } else {
            next[key] = value;
        }
    }

    return next as Partial<BrowseCatalogFilters>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
    filters: { ...initialFilters },
    setFilters: (filters) => set((state) => ({ filters: mergeFilters(state.filters, filters) })),
    updateFilter: (key, value) =>
        set((state) => ({
            filters: mergeFilters(state.filters, { [key]: value }),
        })),
    clearFilters: () => set({ filters: { ...initialFilters } }),
    setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
    resetStore: () => set({ filters: { ...initialFilters } }),
}));
