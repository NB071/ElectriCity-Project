// Order Service (Helpers; for tax)

import {
    TAX_BREAKDOWN_BY_PROVINCE,
    TAX_RATES_BY_PROVINCE,
    DEFAULTS,
} from "../constants.js";

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

/**
 * This function resolves GST/PST/HST component rates for a province.
 * @param {string|null|undefined} province
 * @returns {{ province: string, type: string, gst: number, pst: number, hst: number, applicable: number }|null}
 */
function resolveTaxBreakdown(province) {
    const code =
        province == null || String(province).trim() === ""
            ? DEFAULTS.TAX_PROVINCE
            : normalizeCanadianProvince(province);

    if (code == null) {
        return null;
    }

    const parts = TAX_BREAKDOWN_BY_PROVINCE[code];
    if (!parts) {
        return null;
    }

    return {
        province: code,
        type: parts.type,
        gst: parts.gst,
        pst: parts.pst,
        hst: parts.hst,
        applicable: TAX_RATES_BY_PROVINCE[code],
    };
}

export {
    PROVINCE_CODES,
    PROVINCE_NAME_TO_CODE,
    normalizeCanadianProvince,
    resolveTaxRate,
    resolveTaxBreakdown,
};
