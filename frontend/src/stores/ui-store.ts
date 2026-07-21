import { create } from "zustand";

type UiState = {
    mobileNavOpen: boolean;
    cartDrawerOpen: boolean;
    dashboardSidebarCollapsed: boolean;

    setMobileNavOpen: (open: boolean) => void;
    toggleMobileNav: () => void;

    setCartDrawerOpen: (open: boolean) => void;
    toggleCartDrawer: () => void;

    setDashboardSidebarCollapsed: (collapsed: boolean) => void;
    toggleDashboardSidebar: () => void;

    // Modals
    modals: UiModals;
    openModal: <K extends keyof UiModals>(key: K, data?: UiModals[K]["data"]) => void;
    closeModal: (key: keyof UiModals) => void;
};

export type ModalConfig<T = any> = {
    isOpen: boolean;
    data?: T;
};

export type UiModals = {
    addressForm: ModalConfig<{ mode: "add" | "edit"; addressData?: any }>;
    addressDelete: ModalConfig<{ addressId: number; label?: string }>;
    passwordSuccess: ModalConfig;
    sessionRevoke: ModalConfig<{ sessionId: string; label?: string }>;
    sessionRevokeAll: ModalConfig;
    orderDetail: ModalConfig<{ orderData: any }>;
    wishlistDelete: ModalConfig<{ cid: string; itemName?: string }>;
    reviewDelete: ModalConfig<{ reviewId: number; reviewTitle?: string }>;
    userDetail: ModalConfig<{ userData: any }>;
    mediaDelete: ModalConfig<{ mediaId: number; label?: string }>;
    mediaLink: ModalConfig<{ mediaId: number; label?: string }>;
    mediaRegister: ModalConfig;
    imageGallery: ModalConfig<{ images: any[] }>;
};

const initialModals: UiModals = {
    addressForm: { isOpen: false },
    addressDelete: { isOpen: false },
    passwordSuccess: { isOpen: false },
    sessionRevoke: { isOpen: false },
    sessionRevokeAll: { isOpen: false },
    orderDetail: { isOpen: false },
    wishlistDelete: { isOpen: false },
    reviewDelete: { isOpen: false },
    userDetail: { isOpen: false },
    mediaDelete: { isOpen: false },
    mediaLink: { isOpen: false },
    mediaRegister: { isOpen: false },
    imageGallery: { isOpen: false },
};

export const useUiStore = create<UiState>((set) => ({
    mobileNavOpen: false,
    cartDrawerOpen: false,
    dashboardSidebarCollapsed: false,

    setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
    toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),

    setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
    toggleCartDrawer: () => set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),

    setDashboardSidebarCollapsed: (collapsed) => set({ dashboardSidebarCollapsed: collapsed }),
    toggleDashboardSidebar: () => set((s) => ({ dashboardSidebarCollapsed: !s.dashboardSidebarCollapsed })),

    modals: initialModals,
    openModal: (key, data) =>
        set((state) => ({
            modals: {
                ...state.modals,
                [key]: { isOpen: true, data },
            },
        })),
    closeModal: (key) =>
        set((state) => ({
            modals: {
                ...state.modals,
                [key]: { ...state.modals[key], isOpen: false },
            },
        })),
}));
