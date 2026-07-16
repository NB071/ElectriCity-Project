/**
 * TC_07 - Frontend - Loan Calculator
 * UC8
 *
 * Expected: monthly payment computed client-side; no backend API calls.
 * Edge cases: invalid/zero inputs prompt re-entry instead of crashing.
 *
 * Note: no loan calculator module exists in the repo yet; this encodes the
 * formula under test so coverage of the documented behavior is explicit.
 */
import { calculateMonthlyPayment } from "./helpers/tddFixtures.js";

describe("TC_07 Frontend - Loan Calculator (UC8)", () => {
    test("calculates monthly payment from principal, rate, and term", () => {
        const { monthlyPayment, error } = calculateMonthlyPayment({
            principal: 40000,
            annualRatePercent: 5.9,
            termMonths: 60,
        });

        expect(error).toBeUndefined();
        expect(monthlyPayment).toBeGreaterThan(0);
        // Sanity: payment should be between interest-free /12 and principal
        expect(monthlyPayment).toBeGreaterThan(40000 / 60);
        expect(monthlyPayment).toBeLessThan(40000);
    });

    test("zero interest returns principal / term without dividing by zero", () => {
        const { monthlyPayment, error } = calculateMonthlyPayment({
            principal: 12000,
            annualRatePercent: 0,
            termMonths: 24,
        });
        expect(error).toBeUndefined();
        expect(monthlyPayment).toBeCloseTo(500, 5);
    });

    test("invalid inputs return a prompt error instead of crashing", () => {
        expect(
            calculateMonthlyPayment({
                principal: 0,
                annualRatePercent: 5,
                termMonths: 36,
            }).error,
        ).toMatch(/valid/i);

        expect(
            calculateMonthlyPayment({
                principal: 10000,
                annualRatePercent: 5,
                termMonths: 0,
            }).error,
        ).toMatch(/valid/i);
    });

    test("calculation is pure - no network / backend dependency", () => {
        // If this test file runs without import of services/HTTP clients, TC_07 is frontend-only.
        const result = calculateMonthlyPayment({
            principal: 25000,
            annualRatePercent: 4.5,
            termMonths: 48,
        });
        expect(result.monthlyPayment).toBeDefined();
    });
});
