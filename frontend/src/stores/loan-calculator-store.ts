import { create } from "zustand";

type LoanCalculatorState = {
    vehiclePrice: number;
    downPayment: number;
    annualRatePercent: number;
    termMonths: number;

    setVehiclePrice: (value: number) => void;
    setDownPayment: (value: number) => void;
    setAnnualRatePercent: (value: number) => void;
    setTermMonths: (value: number) => void;
    reset: () => void;
};

const initialLoan = {
    vehiclePrice: 45_000,
    downPayment: 5_000,
    annualRatePercent: 6.9,
    termMonths: 60,
} as const;

export const useLoanCalculatorStore = create<LoanCalculatorState>((set) => ({
    ...initialLoan,

    setVehiclePrice: (vehiclePrice) => set({ vehiclePrice }),
    setDownPayment: (downPayment) => set({ downPayment }),
    setAnnualRatePercent: (annualRatePercent) => set({ annualRatePercent }),
    setTermMonths: (termMonths) => set({ termMonths }),
    reset: () => set({ ...initialLoan }),
}));
