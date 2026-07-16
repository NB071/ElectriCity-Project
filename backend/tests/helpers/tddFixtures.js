/**
 * Shared fixtures for TC_*.test.js live service tests.
 */

import iamService from "../../services/iam/iam.service.js";
import getPool from "../../configs/db.js";
import { VALIDATIONS as PAYMENT_VALIDATIONS } from "../../services/payment/constants.js";

export const ACTIVE_CID = 1;
export const USED_CID_WITH_HISTORY = 2;
export const SECOND_CID = 2;
/** Alternate catalog item for cart tests when cid=1 stock is contested. */
export const ALT_CID = 3;

export const CARD_DETAILS = {
    card_number: "4111111111111111",
    expiry_month: "12",
    expiry_year: "2030",
    cvv: "123",
    cardholder_name: "Test User",
};

export const SHIPPING_ADDRESS = {
    full_name: "Test Shopper",
    phone_number: "4165550100",
    street: "100 Queen St W",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
};

export const PAYMENT_METHODS = PAYMENT_VALIDATIONS.PAYMENT_METHODS;

/**
 * Reset purchasable stock so live cart/checkout tests remain repeatable.
 * @param {number|number[]} cids
 * @param {number} [quantity=25]
 */
export async function ensureCatalogStock(cids, quantity = 25) {
    const pool = await getPool();
    const list = Array.isArray(cids) ? cids : [cids];
    for (const cid of list) {
        await pool.execute(
            `UPDATE catalog_items SET quantity = ?, is_active = TRUE WHERE cid = ?`,
            [quantity, cid],
        );
    }
}

/**
 * Register a unique customer for isolation across tests.
 * @param {string} prefix
 * @returns {Promise<{ email: string, password: string, user: object }>}
 */
export async function registerCustomer(prefix = "tc") {
    const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
    const password = "Password1!";
    const user = await iamService.access_management.register({
        firstName: "TC",
        lastName: "Tester",
        email,
        password,
    });
    return { email, password, user };
}

/**
 * Register + login, returning tokens and authenticated user.
 * @param {string} prefix
 */
export async function registerAndLogin(prefix = "tc") {
    const { email, password, user } = await registerCustomer(prefix);
    const session = await iamService.access_management.login({
        email,
        password,
    });
    const me = await iamService.access_management.authenticateAccessToken(
        `Bearer ${session.accessToken}`,
    );
    return { email, password, user, session, me };
}

/**
 * Standard amortizing monthly payment (frontend loan calculator formula).
 * Returns { monthlyPayment } or { error } for invalid input (no divide-by-zero crash).
 */
export function calculateMonthlyPayment({
    principal,
    annualRatePercent,
    termMonths,
}) {
    if (
        !(principal > 0) ||
        !(termMonths > 0) ||
        annualRatePercent == null ||
        Number.isNaN(Number(annualRatePercent))
    ) {
        return {
            error: "Please enter valid principal, term, and interest rate.",
        };
    }

    const r = Number(annualRatePercent) / 100 / 12;
    if (r === 0) {
        return { monthlyPayment: principal / termMonths };
    }

    const factor = Math.pow(1 + r, termMonths);
    const monthlyPayment = (principal * (r * factor)) / (factor - 1);
    return { monthlyPayment };
}
