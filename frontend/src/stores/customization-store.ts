import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("electricity-db", 1);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (e: any) => e.target.result.createObjectStore("store");
            request.onsuccess = (e: any) => {
                const db = e.target.result;
                // Double check if store exists before transaction, safely return null if not during migration
                if (!db.objectStoreNames.contains("store")) return resolve(null);

                const tx = db.transaction("store", "readonly");
                const store = tx.objectStore("store");
                const getReq = store.get(name);
                getReq.onsuccess = () => resolve(getReq.result || null);
                getReq.onerror = () => reject(getReq.error);
            };
        });
    },
    setItem: async (name: string, value: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("electricity-db", 1);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (e: any) => e.target.result.createObjectStore("store");
            request.onsuccess = (e: any) => {
                const db = e.target.result;
                const tx = db.transaction("store", "readwrite");
                const store = tx.objectStore("store");
                const putReq = store.put(value, name);
                putReq.onsuccess = () => resolve();
                putReq.onerror = () => reject(putReq.error);
            };
        });
    },
    removeItem: async (name: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("electricity-db", 1);
            request.onerror = () => reject(request.error);
            request.onupgradeneeded = (e: any) => e.target.result.createObjectStore("store");
            request.onsuccess = (e: any) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("store")) return resolve();
                const tx = db.transaction("store", "readwrite");
                const store = tx.objectStore("store");
                const delReq = store.delete(name);
                delReq.onsuccess = () => resolve();
                delReq.onerror = () => reject(delReq.error);
            };
        });
    },
};

type CustomizationStore = {
    selections: Record<string, number[]>; // cid -> selected option IDs
    history: string[]; // LRU queue to enforce max 20 limit
    setSelection: (cid: string, optionIds: number[]) => void;
    toggleOption: (cid: string, optionId: number, categoryId: number, selectType: "SINGLE" | "MULTI", vehicleCustomizations: any[]) => void;
    clearSelections: (cid: string) => void;
};

export const useCustomizationStore = create<CustomizationStore>()(
    persist(
        (set) => ({
            selections: {},
            history: [],
            setSelection: (cid, optionIds) =>
                set((state) => {
                    const newSelections = { ...state.selections, [cid]: optionIds };
                    const newHistory = (state.history || Object.keys(state.selections)).filter((id) => id !== cid);
                    newHistory.push(cid);

                    if (newHistory.length > 20) {
                        const oldest = newHistory.shift()!;
                        delete newSelections[oldest];
                    }

                    return { selections: newSelections, history: newHistory };
                }),
            toggleOption: (cid, optionId, categoryId, selectType, vehicleCustomizations) =>
                set((state) => {
                    const prevOptions = state.selections[cid] || [];
                    let nextOptions: number[];

                    if (selectType === "SINGLE") {
                        const categoryOptionIds =
                            vehicleCustomizations.find((c: any) => c.category_id === categoryId)?.options.map((o: any) => o.option_id) || [];
                        nextOptions = [...prevOptions.filter((id) => !categoryOptionIds.includes(id)), optionId];
                    } else {
                        nextOptions = prevOptions.includes(optionId) ? prevOptions.filter((id) => id !== optionId) : [...prevOptions, optionId];
                    }

                    const newSelections = { ...state.selections, [cid]: nextOptions };
                    const newHistory = (state.history || Object.keys(state.selections)).filter((id) => id !== cid);
                    newHistory.push(cid);

                    if (newHistory.length > 20) {
                        const oldest = newHistory.shift()!;
                        delete newSelections[oldest];
                    }

                    return { selections: newSelections, history: newHistory };
                }),
            clearSelections: (cid) =>
                set((state) => {
                    const newSelections = { ...state.selections };
                    delete newSelections[cid];
                    const newHistory = (state.history || Object.keys(state.selections)).filter((id) => id !== cid);
                    return { selections: newSelections, history: newHistory };
                }),
        }),
        {
            name: "electricity-customizations-idb",
            storage: createJSONStorage(() => idbStorage),
        }
    )
);
