import { create } from "zustand";
import { type BrowseCatalogFilters, type SortValue } from "@/zod/browse-catalog";

interface CatalogState {
    filters: Partial<BrowseCatalogFilters>;
    setFilters: (filters: Partial<BrowseCatalogFilters>) => void;
    updateFilter: <K extends keyof BrowseCatalogFilters>(key: K, value: BrowseCatalogFilters[K]) => void;
    clearFilters: () => void;
    setSort: (sort: SortValue) => void;
    resetStore: () => void;
}

const initialFilters: Partial<BrowseCatalogFilters> = {
    sort: "added_desc",
    body_shape: [],
};

export const useCatalogStore = create<CatalogState>((set) => ({
    filters: initialFilters,
    setFilters: (filters) =>
        set((state) => ({
            filters: { ...state.filters, ...filters },
        })),
    updateFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),
    clearFilters: () => set({ filters: initialFilters }),
    setSort: (sort) => set((state) => ({ filters: { ...state.filters, sort } })),
    resetStore: () => set({ filters: initialFilters }),
}));
