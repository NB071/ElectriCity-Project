import { create } from "zustand";

/** Named modals used across the app. Expand as UI lands. */
export type ModalId =
    | "confirm-logout"
    | "confirm-clear-cart"
    | "auth-required"
    | "compare-limit"
    | "delete-address"
    | "delete-review"
    | "image-gallery";

type ModalState = {
    openModals: Partial<Record<ModalId, boolean>>;
    modalData: Partial<Record<ModalId, any>>;

    isOpen: (id: ModalId) => boolean;
    getData: <T = any>(id: ModalId) => T | undefined;
    open: (id: ModalId, data?: any) => void;
    close: (id: ModalId) => void;
    toggle: (id: ModalId, data?: any) => void;
    /** Close every modal. */
    clear: () => void;
};

export const useModalStore = create<ModalState>((set, get) => ({
    openModals: {},
    modalData: {},

    isOpen: (id) => Boolean(get().openModals[id]),
    getData: (id) => get().modalData[id],

    open: (id, data) =>
        set((s) => ({
            openModals: { ...s.openModals, [id]: true },
            modalData: { ...s.modalData, [id]: data !== undefined ? data : s.modalData[id] },
        })),

    close: (id) => set((s) => ({ openModals: { ...s.openModals, [id]: false } })),

    toggle: (id, data) =>
        set((s) => {
            const isNowOpen = !s.openModals[id];
            return {
                openModals: { ...s.openModals, [id]: isNowOpen },
                modalData: { ...s.modalData, [id]: isNowOpen && data !== undefined ? data : s.modalData[id] },
            };
        }),

    clear: () => set({ openModals: {}, modalData: {} }),
}));
