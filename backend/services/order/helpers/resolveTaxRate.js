// Order Service (Helpers; for tax)

import { TAX_RATES_BY_PROVINCE, DEFAULTS } from "../constants.js";

const PROVINCE_NAME_TO_CODE = {
    alberta: "AB",
    "british columbia": "BC",
    manitoba: "MB",
    "new brunswick": "NB",
    "newfoundland and labrador": "NL",
    newfoundland: "NL",
    "nova scotia": "NS",
    "northwest territories": "NT",
    nunavut: "NU",
    ontario: "ON",
    "prince edward island": "PE",
    quebec: "QC",
    québec: "QC",
    saskatchewan: "SK",
    yukon: "YT",
};

const PROVINCE_CODES = Object.keys(TAX_RATES_BY_PROVINCE);

/**
 * This function normalizes a Canadian province/territory to its 2-letter code.
 * @param {string|null|undefined} province
 * @returns {string|null} Canonical code or null if unknown/missing
 */
function normalizeCanadianProvince(province) {
    if (province == null || String(province).trim() === "") {
        return null;
    }

    const raw = String(province).trim();
    const asCode = raw.toUpperCase();
    if (TAX_RATES_BY_PROVINCE[asCode] != null) {
        return asCode;
    }

    const mapped = PROVINCE_NAME_TO_CODE[raw.toLowerCase()];
    if (mapped != null && TAX_RATES_BY_PROVINCE[mapped] != null) {
        return mapped;
    }

    return null;
}

/**
 * This function resolves a Canadian tax rate from a province code or name.
 * @param {string|null|undefined} province
 * @returns {number|null}
 */
function resolveTaxRate(province) {
    if (province == null || String(province).trim() === "") {
        return DEFAULTS.TAX_RATE;
    }

    const code = normalizeCanadianProvince(province);
    if (code == null) {
        return null;
    }

    return TAX_RATES_BY_PROVINCE[code];
}

export {
    PROVINCE_CODES,
    PROVINCE_NAME_TO_CODE,
    normalizeCanadianProvince,
    resolveTaxRate,
};
