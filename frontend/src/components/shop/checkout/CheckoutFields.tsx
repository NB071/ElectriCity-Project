import { Field, ErrorMessage, type FormikErrors, type FormikTouched } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CANADIAN_PROVINCES, formatAddressLabel } from "@/lib/checkout";
import type { AddressResponse } from "@/hooks/api/iam/use-addresses";
import type { CheckoutFormValues } from "@/zod/checkout";

type FieldProps = {
    name: keyof CheckoutFormValues | string;
    label: string;
    placeholder?: string;
    type?: string;
    errors: FormikErrors<CheckoutFormValues>;
    touched: FormikTouched<CheckoutFormValues>;
    required?: boolean;
    disabled?: boolean;
};

function fieldError(errors: FormikErrors<CheckoutFormValues>, touched: FormikTouched<CheckoutFormValues>, name: string) {
    const err = (errors as Record<string, unknown>)[name];
    const touch = (touched as Record<string, unknown>)[name];
    return Boolean(err && touch);
}

export function CheckoutTextField({ name, label, placeholder, type = "text", errors, touched, required, disabled }: FieldProps) {
    const hasError = fieldError(errors, touched, name);
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={name} className={hasError ? "text-destructive" : "text-muted-foreground"}>
                {label}
                {required ? " *" : ""}
            </Label>
            <Field as={Input} id={name} name={name} type={type} placeholder={placeholder} disabled={disabled} />
            <ErrorMessage name={name} component="div" className="text-destructive text-xs" />
        </div>
    );
}

type ProvinceSelectProps = {
    name: "province" | "shipping_province";
    label: string;
    value: string;
    onChange: (value: string) => void;
    errors: FormikErrors<CheckoutFormValues>;
    touched: FormikTouched<CheckoutFormValues>;
};

export function ProvinceSelectField({ name, label, value, onChange, errors, touched }: ProvinceSelectProps) {
    const hasError = fieldError(errors, touched, name);
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={name} className={hasError ? "text-destructive" : "text-muted-foreground"}>
                {label} *
            </Label>
            <Select value={value || undefined} onValueChange={onChange}>
                <SelectTrigger id={name} className="w-full">
                    <SelectValue placeholder="Select province / territory" />
                </SelectTrigger>
                <SelectContent>
                    {CANADIAN_PROVINCES.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                            {province.name} ({province.code})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <ErrorMessage name={name} component="div" className="text-destructive text-xs" />
        </div>
    );
}

type SavedAddressSelectProps = {
    addresses: AddressResponse[];
    value: number | null | undefined;
    onSelect: (address: AddressResponse | null) => void;
    label?: string;
};

export function SavedAddressSelect({ addresses, value, onSelect, label = "Saved address" }: SavedAddressSelectProps) {
    if (addresses.length === 0) return null;

    return (
        <div className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-3">
            <Label className="text-muted-foreground">{label}</Label>
            <Select
                value={value != null ? String(value) : "manual"}
                onValueChange={(next) => {
                    if (next === "manual") {
                        onSelect(null);
                        return;
                    }
                    const address = addresses.find((item) => item.address_id === Number(next));
                    onSelect(address ?? null);
                }}
            >
                <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Choose a saved address" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="manual">Enter address manually</SelectItem>
                    {addresses.map((address) => (
                        <SelectItem key={address.address_id} value={String(address.address_id)}>
                            {formatAddressLabel(address)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
