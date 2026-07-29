import { useApiQuery } from "@/hooks/use-api";

// Endpoints: [GET] /api/shop/catalog/compare

export type CompareColumn = {
    id: number;
    label: string;
};

export type CompareCell = {
    value: unknown;
    isBest: boolean;
    isTied: boolean;
    isWorse: boolean;
};

export type CompareRow = {
    field: string;
    cells: CompareCell[];
};

export type CompareResult = {
    columns: CompareColumn[];
    rows: CompareRow[];
};

const compareKeys = {
    all: ["compare"] as const,
    byCids: (cids: number[]) => [...compareKeys.all, [...cids].sort((a, b) => a - b)] as const,
};

// Endpoints: [GET] /api/shop/catalog/compare
// Supports 2 to 5 catalog ids
export const useCompareCatalogItems = (cids: number[]) => {
    return useApiQuery<CompareResult>({
        queryKey: compareKeys.byCids(cids),
        url: "/api/shop/catalog/compare",
        method: "get",
        params: { cids: cids.join(",") },
        enabled: cids.length >= 2 && cids.length <= 5,
    });
};
