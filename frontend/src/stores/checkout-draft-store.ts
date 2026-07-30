import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";
import type { CheckoutFormValues } from "@/zod/checkout";

export type CheckoutDraftValues = Omit<CheckoutFormValues, "card_number" | "expiry_month" | "expiry_year" | "cvv" | "cardholder_name">;

const initialDraft: CheckoutDraftValues = {
    firstName: "",
    lastName: "",
    country: "Canada",
    street: "",
    apartment: "",
    city: "",
    province: "",
    postal_code: "",
    phone: "",
    email: "",
    additional_information: "",
    paymentMethod: "credit",
    shipping_country: "Canada",
    shipping_street: "",
    shipping_city: "",
    shipping_province: "",
    shipping_postal_code: "",
    sameAsPersonal: true,
    billing_address_id: null,
    shipping_address_id: null,
};

import { env } from "@/lib/env";

const ENCRYPTION_KEY = env.VITE_STORAGE_SECRET;
type CheckoutDraftState = {
    draft: CheckoutDraftValues;
    activeStep: string;
    maxLevel: number;
    setField: <K extends keyof CheckoutDraftValues>(key: K, value: CheckoutDraftValues[K]) => void;
    setDraft: (values: Partial<CheckoutDraftValues>) => void;
    setCheckoutProgress: (step: string, level: number) => void;
    reset: () => void;
};

const secureStorage: StateStorage = {
    getItem: (name: string): string | null => {
        const str = localStorage.getItem(name);
        if (!str) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(str, ENCRYPTION_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) return null;
            return decrypted;
        } catch (e) {
            console.error("Storage decryption failed.", e);
            return null;
        }
    },
    setItem: (name: string, value: string): void => {
        const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
        localStorage.setItem(name, encrypted);
    },
    removeItem: (name: string): void => {
        localStorage.removeItem(name);
    },
};

export const useCheckoutDraftStore = create<CheckoutDraftState>()(
    persist(
        (set) => ({
            draft: initialDraft,
            activeStep: "personal",
            maxLevel: 0,
            setField: (key, value) =>
                set((state) => ({
                    draft: { ...state.draft, [key]: value },
                })),
            setDraft: (values) =>
                set((state) => ({
                    draft: { ...state.draft, ...values },
                })),
            setCheckoutProgress: (step, level) => set({ activeStep: step, maxLevel: level }),
            reset: () => set({ draft: initialDraft, activeStep: "personal", maxLevel: 0 }),
        }),
        {
            name: "electricity-checkout-draft",
            storage: createJSONStorage(() => secureStorage),
        }
    )
);
