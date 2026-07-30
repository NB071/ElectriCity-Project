import type { CheckoutFormValues } from "@/zod/checkout";
import type { AddressResponse } from "@/hooks/api/iam/use-addresses";

export const CANADIAN_PROVINCES = [
    { code: "AB", name: "Alberta" },
    { code: "BC", name: "British Columbia" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "ON", name: "Ontario" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "QC", name: "Quebec" },
    { code: "SK", name: "Saskatchewan" },
    { code: "YT", name: "Yukon" },
] as const;

export type CheckoutAddressPayload = {
    full_name: string;
    phone_number: string | null;
    street: string;
    city: string;
    province: string;
    country: string;
    postal_code: string;
};

export type CheckoutApiPayload = {
    guest_email?: string;
    shipping_address: CheckoutAddressPayload;
    billing_address: CheckoutAddressPayload;
    payment_method: "credit_card" | "debit_card" | "apple_pay";
    payment_details:
        | {
              card_number: string;
              expiry_month: string;
              expiry_year: string;
              cvv: string;
              cardholder_name: string;
          }
        | { token: string };
    additional_information?: string;
};

export function formatCad(amount: number) {
    return amount.toLocaleString("en-CA", {
        style: "currency",
        currency: "CAD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatAddressLabel(address: AddressResponse) {
    const defaultTag = address.is_default ? " (Default)" : "";
    return `${address.street}, ${address.city}, ${address.province} ${address.postal_code}${defaultTag}`;
}

function fullName(values: CheckoutFormValues) {
    return `${values.firstName} ${values.lastName}`.trim();
}

function billingAddressFromForm(values: CheckoutFormValues): CheckoutAddressPayload {
    return {
        full_name: fullName(values),
        phone_number: values.phone?.trim() ? values.phone.trim() : null,
        street: values.street.trim(),
        city: values.city.trim(),
        province: values.province.trim(),
        country: values.country.trim(),
        postal_code: values.postal_code.trim(),
    };
}

function shippingAddressFromForm(values: CheckoutFormValues): CheckoutAddressPayload {
    if (values.sameAsPersonal) {
        return billingAddressFromForm(values);
    }

    return {
        full_name: fullName(values),
        phone_number: values.phone?.trim() ? values.phone.trim() : null,
        street: (values.shipping_street ?? "").trim(),
        city: (values.shipping_city ?? "").trim(),
        province: (values.shipping_province ?? "").trim(),
        country: (values.shipping_country ?? "").trim(),
        postal_code: (values.shipping_postal_code ?? "").trim(),
    };
}

function mapPaymentMethod(method: CheckoutFormValues["paymentMethod"]): CheckoutApiPayload["payment_method"] {
    if (method === "credit") return "credit_card";
    if (method === "debit") return "debit_card";
    return "apple_pay";
}

/**
 * Maps the flat Formik checkout form into the nested shop checkout API body.
 */
export function buildCheckoutPayload(values: CheckoutFormValues, isGuest: boolean): CheckoutApiPayload {
    const payment_method = mapPaymentMethod(values.paymentMethod);
    const payment_details =
        payment_method === "apple_pay"
            ? { token: "demo-apple-pay-token" }
            : {
                  card_number: (values.card_number ?? "").replace(/\s/g, ""),
                  expiry_month: values.expiry_month ?? "",
                  expiry_year: values.expiry_year ?? "",
                  cvv: values.cvv ?? "",
                  cardholder_name: values.cardholder_name ?? "",
              };

    return {
        ...(isGuest && values.email ? { guest_email: values.email } : {}),
        shipping_address: shippingAddressFromForm(values),
        billing_address: billingAddressFromForm(values),
        payment_method,
        payment_details,
        ...(values.additional_information?.trim()
            ? { additional_information: values.additional_information.trim() }
            : {}),
    };
}

export function resolveShippingProvince(values: Pick<CheckoutFormValues, "sameAsPersonal" | "province" | "shipping_province">) {
    const province = values.sameAsPersonal ? values.province : values.shipping_province;
    return province?.trim() || "";
}

/** Normalize province/territory to a 2-letter code when possible (for selects + tax). */
export function normalizeProvinceCode(province: string): string {
    const raw = province.trim();
    if (!raw) return "";
    const asCode = raw.toUpperCase();
    if (CANADIAN_PROVINCES.some((p) => p.code === asCode)) return asCode;
    const byName = CANADIAN_PROVINCES.find((p) => p.name.toLowerCase() === raw.toLowerCase());
    return byName?.code ?? raw;
}

export function applySavedAddressToBilling(
    address: AddressResponse,
): Pick<CheckoutFormValues, "street" | "city" | "province" | "country" | "postal_code"> {
    return {
        street: address.street,
        city: address.city,
        province: normalizeProvinceCode(address.province),
        country: address.country,
        postal_code: address.postal_code,
    };
}

export function applySavedAddressToShipping(
    address: AddressResponse,
): Pick<
    CheckoutFormValues,
    "shipping_street" | "shipping_city" | "shipping_province" | "shipping_country" | "shipping_postal_code"
> {
    return {
        shipping_street: address.street,
        shipping_city: address.city,
        shipping_province: normalizeProvinceCode(address.province),
        shipping_country: address.country,
        shipping_postal_code: address.postal_code,
    };
}
