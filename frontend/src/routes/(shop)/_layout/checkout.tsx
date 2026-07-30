import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowUpRight, CheckCircle2, Circle, Loader2, ShoppingCart } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { QueryError } from "@/components/common/QueryError";
import { EmptyState } from "@/components/common/EmptyState";
import { CheckoutTextField, ProvinceSelectField, SavedAddressSelect } from "@/components/shop/checkout/CheckoutFields";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CreditCardVisual } from "@/components/ui/credit-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetCart } from "@/hooks/api/cart/use-cart-queries";
import { useGetMyAddresses, type AddressResponse } from "@/hooks/api/iam/use-addresses";
import { useCalculateCheckout, useCheckout } from "@/hooks/api/order/use-checkout";
import { useAuthStatus } from "@/hooks/use-me";
import {
    applySavedAddressToBilling,
    applySavedAddressToShipping,
    buildCheckoutPayload,
    formatCad,
    resolveShippingProvince,
} from "@/lib/checkout";
import { mediaUrl } from "@/lib/media";
import { useCheckoutDraftStore } from "@/stores";
import { getCheckoutSchema, type CheckoutFormValues } from "@/zod/checkout";

export const Route = createFileRoute("/(shop)/_layout/checkout")({
    component: CheckoutPage,
});

function CalculatedAmount({
    amount,
    isLoading,
    className = "font-semibold",
}: {
    amount: number;
    isLoading: boolean;
    className?: string;
}) {
    return (
        <span className={className}>
            {isLoading ? (
                <Loader2 className="text-muted-foreground size-4 animate-spin" aria-label="Recalculating" />
            ) : (
                formatCad(amount)
            )}
        </span>
    );
}

function CheckoutPage() {
    const { user, status } = useAuthStatus();
    const isGuest = status === "guest";
    const isCustomer = status === "authenticated" && user?.role === "customer";

    const setDraft = useCheckoutDraftStore((s) => s.setDraft);
    const setCheckoutProgress = useCheckoutDraftStore((s) => s.setCheckoutProgress);
    const activeStep = useCheckoutDraftStore((s) => s.activeStep);
    const maxLevel = useCheckoutDraftStore((s) => s.maxLevel);
    const [initialDraft] = useState(() => useCheckoutDraftStore.getState().draft);

    const cartQuery = useGetCart(1, 100);
    const addressesQuery = useGetMyAddresses(1, 50, { enabled: isCustomer });
    const checkoutMutation = useCheckout();

    const cartItems = cartQuery.data?.items ?? [];
    const savedAddresses = isCustomer ? (addressesQuery.data?.items ?? []) : [];
    const hasCartItems = cartItems.length > 0;

    const initialValues: CheckoutFormValues = useMemo(() => {
        const draft = { ...initialDraft } as CheckoutFormValues;
        if (user) {
            draft.firstName = user.first_name ?? "";
            draft.lastName = user.last_name ?? "";
            draft.email = user.email ?? "";
            draft.phone = user.phone_number ?? "";
        }
        if (!draft.country) draft.country = "Canada";
        if (!draft.shipping_country) draft.shipping_country = "Canada";
        draft.card_number = "";
        draft.expiry_month = "";
        draft.expiry_year = "";
        draft.cvv = "";
        draft.cardholder_name = "";
        return draft;
    }, [initialDraft, user]);

    if (cartQuery.isPending || status === "unknown") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
        );
    }

    if (cartQuery.isError) {
        return (
            <div className="mx-auto mt-18 w-full max-w-7xl px-4 py-8">
                <QueryError
                    title="Couldn't load your cart"
                    error={cartQuery.error}
                    onRetry={() => void cartQuery.refetch()}
                    isRetrying={cartQuery.isFetching}
                />
            </div>
        );
    }

    if (!hasCartItems) {
        return (
            <div className="mx-auto mt-18 w-full max-w-7xl px-4 py-8">
                <Breadcrumbs />
                <EmptyState
                    icon={ShoppingCart}
                    title="Your cart is empty"
                    description="Add vehicles to your cart before checking out."
                    className="mt-8 border"
                >
                    <Button asChild>
                        <Link to="/catalog">Browse catalog</Link>
                    </Button>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="mx-auto mt-18 w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
                <Breadcrumbs />
                <h1 className="mt-4 text-4xl font-bold tracking-tight">Shop Checkout</h1>
            </div>

            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={toFormikValidationSchema(getCheckoutSchema(isGuest))}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        await checkoutMutation.mutateAsync({
                            body: buildCheckoutPayload(values, isGuest),
                        });
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ values, setFieldValue, setValues, setTouched, errors, touched, validateForm, isSubmitting }) => (
                    <CheckoutFormBody
                        values={values}
                        setFieldValue={setFieldValue}
                        setValues={setValues}
                        setTouched={setTouched}
                        errors={errors}
                        touched={touched}
                        validateForm={validateForm}
                        isSubmitting={isSubmitting || checkoutMutation.isPending}
                        isGuest={isGuest}
                        isCustomer={isCustomer}
                        savedAddresses={savedAddresses}
                        cartItems={cartItems}
                        activeStep={activeStep}
                        maxLevel={maxLevel}
                        setDraft={setDraft}
                        setCheckoutProgress={setCheckoutProgress}
                    />
                )}
            </Formik>
        </div>
    );
}

type CheckoutFormBodyProps = {
    values: CheckoutFormValues;
    setFieldValue: (field: string, value: unknown) => void;
    setValues: (values: CheckoutFormValues) => void;
    setTouched: (touched: Record<string, boolean>, shouldValidate?: boolean) => void;
    errors: Record<string, unknown>;
    touched: Record<string, unknown>;
    validateForm: () => Promise<Record<string, unknown>>;
    isSubmitting: boolean;
    isGuest: boolean;
    isCustomer: boolean;
    savedAddresses: AddressResponse[];
    cartItems: NonNullable<ReturnType<typeof useGetCart>["data"]>["items"];
    activeStep: string;
    maxLevel: number;
    setDraft: (values: Partial<CheckoutFormValues>) => void;
    setCheckoutProgress: (step: string, level: number) => void;
};

function CheckoutFormBody({
    values,
    setFieldValue,
    setValues,
    setTouched,
    errors,
    touched,
    validateForm,
    isSubmitting,
    isGuest,
    isCustomer,
    savedAddresses,
    cartItems,
    activeStep,
    maxLevel,
    setDraft,
    setCheckoutProgress,
}: CheckoutFormBodyProps) {
    const shippingProvince = resolveShippingProvince(values);
    const [debouncedProvince, setDebouncedProvince] = useState(shippingProvince);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedProvince(shippingProvince), 350);
        return () => window.clearTimeout(timer);
    }, [shippingProvince]);

    useEffect(() => {
        setDraft({
            firstName: values.firstName,
            lastName: values.lastName,
            country: values.country,
            street: values.street,
            apartment: values.apartment,
            city: values.city,
            province: values.province,
            postal_code: values.postal_code,
            phone: values.phone,
            email: values.email,
            additional_information: values.additional_information,
            paymentMethod: values.paymentMethod,
            shipping_country: values.shipping_country,
            shipping_street: values.shipping_street,
            shipping_city: values.shipping_city,
            shipping_province: values.shipping_province,
            shipping_postal_code: values.shipping_postal_code,
            sameAsPersonal: values.sameAsPersonal,
            billing_address_id: values.billing_address_id,
            shipping_address_id: values.shipping_address_id,
        });
    }, [values, setDraft]);

    const calculateQuery = useCalculateCheckout(debouncedProvince, {
        enabled: debouncedProvince.length > 0,
    });

    const isStep1Valid =
        !errors.firstName &&
        !errors.lastName &&
        !errors.email &&
        !errors.country &&
        !errors.street &&
        !errors.city &&
        !errors.province &&
        !errors.postal_code;

    const isStep2Valid =
        isStep1Valid &&
        (values.sameAsPersonal ||
            (!errors.shipping_street &&
                !errors.shipping_city &&
                !errors.shipping_province &&
                !errors.shipping_postal_code &&
                !errors.shipping_country));

    const currentMaxLevel = Math.min(maxLevel, isStep1Valid ? (isStep2Valid ? 2 : 1) : 0);

    function applyBillingAddress(address: AddressResponse | null) {
        if (!address) {
            setFieldValue("billing_address_id", null);
            return;
        }
        setValues({
            ...values,
            ...applySavedAddressToBilling(address),
            billing_address_id: address.address_id,
        });
    }

    function applyShippingAddress(address: AddressResponse | null) {
        if (!address) {
            setFieldValue("shipping_address_id", null);
            return;
        }
        setValues({
            ...values,
            ...applySavedAddressToShipping(address),
            sameAsPersonal: false,
            shipping_address_id: address.address_id,
        });
    }

    const totals = calculateQuery.data;
    const taxAmounts = totals?.tax_breakdown.amounts;

    return (
        <Form className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
                <Accordion
                    type="single"
                    value={activeStep}
                    onValueChange={(val) => {
                        if (!val) return;
                        const level = val === "personal" ? 0 : val === "shipping" ? 1 : 2;
                        if (level <= currentMaxLevel) setCheckoutProgress(val, maxLevel);
                    }}
                    className="flex flex-col gap-4"
                >
                    <AccordionItem value="personal" className="bg-card rounded-xl border px-6 shadow-sm">
                        <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                            <div className="flex items-center gap-3">
                                {activeStep === "shipping" || activeStep === "payment" ? (
                                    <CheckCircle2 className="size-6 text-green-500" />
                                ) : (
                                    <div className="text-primary border-primary flex size-6 items-center justify-center rounded-full border-2 text-sm font-bold">
                                        1
                                    </div>
                                )}
                                <span>Your Personal Details</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 pt-2 pb-6">
                            {isCustomer ? (
                                <SavedAddressSelect
                                    addresses={savedAddresses}
                                    value={values.billing_address_id}
                                    onSelect={applyBillingAddress}
                                    label="Fill billing address from saved addresses"
                                />
                            ) : null}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CheckoutTextField
                                    name="firstName"
                                    label="First Name"
                                    placeholder="First Name"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required
                                    disabled={isCustomer}
                                />
                                <CheckoutTextField
                                    name="lastName"
                                    label="Last Name"
                                    placeholder="Last Name"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required
                                    disabled={isCustomer}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CheckoutTextField
                                    name="email"
                                    label="Email Address"
                                    placeholder="Email address"
                                    type="email"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required={isGuest}
                                    disabled={isCustomer}
                                />
                                <CheckoutTextField
                                    name="phone"
                                    label="Phone"
                                    placeholder="Phone"
                                    errors={errors as never}
                                    touched={touched as never}
                                    disabled={isCustomer}
                                />
                            </div>

                            <CheckoutTextField
                                name="street"
                                label="Mailing Address"
                                placeholder="Street address"
                                errors={errors as never}
                                touched={touched as never}
                                required
                            />

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CheckoutTextField
                                    name="city"
                                    label="City"
                                    placeholder="City"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required
                                />
                                <CheckoutTextField
                                    name="postal_code"
                                    label="Postal Code"
                                    placeholder="Postal Code"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <CheckoutTextField
                                    name="country"
                                    label="Country"
                                    placeholder="Canada"
                                    errors={errors as never}
                                    touched={touched as never}
                                    required
                                />
                                <ProvinceSelectField
                                    name="province"
                                    label="Province / Territory"
                                    value={values.province}
                                    onChange={(value) => {
                                        void setFieldValue("province", value);
                                        void setFieldValue("billing_address_id", null);
                                    }}
                                    errors={errors as never}
                                    touched={touched as never}
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="px-8"
                                    onClick={async () => {
                                        const currentErrors = await validateForm();
                                        setTouched(
                                            {
                                                ...touched,
                                                firstName: true,
                                                lastName: true,
                                                email: true,
                                                country: true,
                                                street: true,
                                                city: true,
                                                province: true,
                                                postal_code: true,
                                            },
                                            true,
                                        );
                                        if (
                                            !currentErrors.firstName &&
                                            !currentErrors.lastName &&
                                            !currentErrors.email &&
                                            !currentErrors.country &&
                                            !currentErrors.street &&
                                            !currentErrors.city &&
                                            !currentErrors.province &&
                                            !currentErrors.postal_code
                                        ) {
                                            setCheckoutProgress("shipping", Math.max(maxLevel, 1));
                                        }
                                    }}
                                >
                                    Next Step
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="shipping" className="bg-card rounded-xl border px-6 shadow-sm">
                        <AccordionTrigger
                            disabled={currentMaxLevel < 1}
                            className="text-xl font-semibold hover:no-underline data-disabled:cursor-not-allowed data-disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                {activeStep === "payment" ? (
                                    <CheckCircle2 className="size-6 text-green-500" />
                                ) : (
                                    <div className="text-primary border-primary flex size-6 items-center justify-center rounded-full border-2 text-sm font-bold">
                                        2
                                    </div>
                                )}
                                <span>Shipping Address</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 pt-2 pb-6">
                            <label className="flex cursor-pointer items-center gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={values.sameAsPersonal}
                                    onChange={(e) => {
                                        void setFieldValue("sameAsPersonal", e.target.checked);
                                        if (e.target.checked) {
                                            void setFieldValue("shipping_address_id", null);
                                        }
                                    }}
                                    className="size-4"
                                />
                                <span>Same as billing / personal address</span>
                            </label>

                            {!values.sameAsPersonal ? (
                                <>
                                    {isCustomer ? (
                                        <SavedAddressSelect
                                            addresses={savedAddresses}
                                            value={values.shipping_address_id}
                                            onSelect={applyShippingAddress}
                                            label="Fill shipping address from saved addresses"
                                        />
                                    ) : null}

                                    <CheckoutTextField
                                        name="shipping_street"
                                        label="Shipping Address"
                                        placeholder="Street address"
                                        errors={errors as never}
                                        touched={touched as never}
                                        required
                                    />
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <CheckoutTextField
                                            name="shipping_city"
                                            label="City"
                                            placeholder="City"
                                            errors={errors as never}
                                            touched={touched as never}
                                            required
                                        />
                                        <CheckoutTextField
                                            name="shipping_postal_code"
                                            label="Postal Code"
                                            placeholder="Postal Code"
                                            errors={errors as never}
                                            touched={touched as never}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <CheckoutTextField
                                            name="shipping_country"
                                            label="Country"
                                            placeholder="Canada"
                                            errors={errors as never}
                                            touched={touched as never}
                                            required
                                        />
                                        <ProvinceSelectField
                                            name="shipping_province"
                                            label="Province / Territory"
                                            value={values.shipping_province ?? ""}
                                            onChange={(value) => {
                                                void setFieldValue("shipping_province", value);
                                                void setFieldValue("shipping_address_id", null);
                                            }}
                                            errors={errors as never}
                                            touched={touched as never}
                                        />
                                    </div>
                                </>
                            ) : null}

                            <div className="pt-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="px-8"
                                    onClick={async () => {
                                        const currentErrors = await validateForm();
                                        setTouched(
                                            {
                                                ...touched,
                                                shipping_street: true,
                                                shipping_city: true,
                                                shipping_postal_code: true,
                                                shipping_country: true,
                                                shipping_province: true,
                                            },
                                            true,
                                        );
                                        if (
                                            values.sameAsPersonal ||
                                            (!currentErrors.shipping_street &&
                                                !currentErrors.shipping_city &&
                                                !currentErrors.shipping_postal_code &&
                                                !currentErrors.shipping_country &&
                                                !currentErrors.shipping_province)
                                        ) {
                                            setCheckoutProgress("payment", Math.max(maxLevel, 2));
                                        }
                                    }}
                                >
                                    Next Step
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="payment" className="bg-card rounded-xl border px-6 shadow-sm">
                        <AccordionTrigger
                            disabled={currentMaxLevel < 2}
                            className="text-xl font-semibold hover:no-underline data-disabled:cursor-not-allowed data-disabled:opacity-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="text-primary border-primary flex size-6 items-center justify-center rounded-full border-2 text-sm font-bold">
                                    3
                                </div>
                                <span>Payment Info</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 pt-2 pb-6">
                            {(["credit", "debit", "apple_pay"] as const).map((method) => (
                                <label key={method} className="flex cursor-pointer items-start gap-3 text-sm">
                                    {values.paymentMethod === method ? (
                                        <CheckCircle2 className="text-primary mt-0.5 size-5" />
                                    ) : (
                                        <Circle
                                            className="text-muted-foreground mt-0.5 size-5"
                                            onClick={() => void setFieldValue("paymentMethod", method)}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        className={`font-semibold ${values.paymentMethod === method ? "text-foreground" : "text-muted-foreground"}`}
                                        onClick={() => void setFieldValue("paymentMethod", method)}
                                    >
                                        {method === "credit" ? "Credit Card" : method === "debit" ? "Debit Card" : "Apple Pay"}
                                    </button>
                                </label>
                            ))}

                            {(values.paymentMethod === "credit" || values.paymentMethod === "debit") && (
                                <div className="flex flex-col gap-4 pt-2">
                                    <CreditCardVisual
                                        cardNumber={values.card_number ?? ""}
                                        cardHolder={values.cardholder_name ?? ""}
                                        expiresMonth={values.expiry_month ?? ""}
                                        expiresYear={values.expiry_year ?? ""}
                                    />
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="card_number">Card Number *</Label>
                                            <Field as={Input} id="card_number" name="card_number" placeholder="ACCT-000003" />
                                            <ErrorMessage name="card_number" component="div" className="text-destructive text-xs" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="cardholder_name">Name on Card *</Label>
                                            <Field as={Input} id="cardholder_name" name="cardholder_name" placeholder="John Doe" />
                                            <ErrorMessage name="cardholder_name" component="div" className="text-destructive text-xs" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="expiry_month">MM *</Label>
                                                <Field as={Input} id="expiry_month" name="expiry_month" placeholder="MM" maxLength={2} />
                                                <ErrorMessage name="expiry_month" component="div" className="text-destructive text-xs" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="expiry_year">YY *</Label>
                                                <Field as={Input} id="expiry_year" name="expiry_year" placeholder="YY" maxLength={2} />
                                                <ErrorMessage name="expiry_year" component="div" className="text-destructive text-xs" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="cvv">CVV *</Label>
                                                <Field as={Input} id="cvv" name="cvv" placeholder="123" type="password" maxLength={4} />
                                                <ErrorMessage name="cvv" component="div" className="text-destructive text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {values.paymentMethod === "apple_pay" ? (
                                <p className="text-muted-foreground text-xs">
                                    Apple Pay will be simulated with a demo token for this project environment.
                                </p>
                            ) : null}

                            <ErrorMessage name="paymentMethod" component="div" className="text-destructive text-xs" />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="text-foreground mt-8 flex flex-col gap-2">
                    <Label htmlFor="additional_information">Additional Information (Order Notes)</Label>
                    <Field
                        as={Textarea}
                        id="additional_information"
                        name="additional_information"
                        placeholder="Notes about your order, e.g. special notes for delivery"
                        className="min-h-25 resize-y"
                    />
                    <ErrorMessage name="additional_information" component="div" className="text-destructive text-xs" />
                </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-5">
                <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold">Your order</h3>
                    <div className="flex flex-col gap-4 text-sm">
                        <div className="text-muted-foreground flex justify-between border-b pb-4 font-medium">
                            <span>Product</span>
                            <span>Subtotal</span>
                        </div>

                        <div className="custom-scrollbar max-h-[40vh] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.cart_item_id} className="flex flex-col border-b py-2 pb-4">
                                    <div className="flex justify-between gap-3 pb-1">
                                        <div className="flex min-w-0 items-start gap-3">
                                            {item.catalog_item.primary_image_url ? (
                                                <img
                                                    src={mediaUrl(item.catalog_item.primary_image_url) ?? undefined}
                                                    alt={item.catalog_item.name}
                                                    className="size-12 rounded object-cover"
                                                />
                                            ) : null}
                                            <div className="min-w-0">
                                                <Link
                                                    to="/catalog/$cid"
                                                    params={{ cid: String(item.cid) }}
                                                    className="text-primary line-clamp-2 hover:underline"
                                                >
                                                    {item.catalog_item.name}{" "}
                                                    <span className="text-muted-foreground text-xs">x {item.quantity}</span>
                                                </Link>
                                            </div>
                                        </div>
                                        <span className="shrink-0 font-medium">{formatCad(item.line_total)}</span>
                                    </div>
                                    {item.configuration?.options?.length ? (
                                        <div className="text-muted-foreground mt-1 flex flex-col gap-1.5 pl-2 text-xs">
                                            {item.configuration.options.map((opt) => (
                                                <div key={opt.option_id} className="flex justify-between gap-3 pr-1">
                                                    <span>
                                                        - {opt.category_name}: {opt.name}
                                                    </span>
                                                    <span className="text-muted-foreground/70 text-[10px]">
                                                        (+{formatCad(opt.price_delta)})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>

                        {!debouncedProvince ? (
                            <p className="text-muted-foreground text-xs">Select a shipping province to calculate tax.</p>
                        ) : calculateQuery.isError ? (
                            <QueryError
                                title="Couldn't calculate tax"
                                error={calculateQuery.error}
                                onRetry={() => void calculateQuery.refetch()}
                                isRetrying={calculateQuery.isFetching}
                                className="p-3 text-xs"
                            />
                        ) : totals ? (
                            <>
                                <div className="flex justify-between pt-2">
                                    <span className="text-muted-foreground font-medium">Subtotal</span>
                                    <CalculatedAmount amount={totals.subtotal} isLoading={calculateQuery.isFetching} />
                                </div>
                                {taxAmounts?.gst ? (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">
                                            GST ({(totals.tax_breakdown.rates.gst * 100).toFixed(2)}%)
                                        </span>
                                        <CalculatedAmount amount={taxAmounts.gst} isLoading={calculateQuery.isFetching} />
                                    </div>
                                ) : null}
                                {taxAmounts?.pst ? (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">
                                            {totals.province === "QC" ? "QST" : "PST"} (
                                            {(totals.tax_breakdown.rates.pst * 100).toFixed(3).replace(/0+$/, "").replace(/\.$/, "")}%)
                                        </span>
                                        <CalculatedAmount amount={taxAmounts.pst} isLoading={calculateQuery.isFetching} />
                                    </div>
                                ) : null}
                                {taxAmounts?.hst ? (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground font-medium">
                                            HST ({(totals.tax_breakdown.rates.hst * 100).toFixed(0)}%)
                                        </span>
                                        <CalculatedAmount amount={taxAmounts.hst} isLoading={calculateQuery.isFetching} />
                                    </div>
                                ) : null}
                                <div className="flex justify-between border-b py-2 pb-4">
                                    <span className="text-muted-foreground font-medium">Tax total</span>
                                    <CalculatedAmount amount={totals.tax} isLoading={calculateQuery.isFetching} />
                                </div>
                                <div className="flex justify-between pt-2 text-lg font-bold">
                                    <span>Total</span>
                                    <CalculatedAmount amount={totals.total} isLoading={calculateQuery.isFetching} className="" />
                                </div>
                                <p className="text-muted-foreground text-[11px]">
                                    Tax for {totals.province} ({totals.tax_breakdown.type.replaceAll("_", " + ").toUpperCase()})
                                </p>
                            </>
                        ) : (
                            <>
                                {["Subtotal", "Tax total", "Total"].map((label) => (
                                    <div
                                        key={label}
                                        className={`flex justify-between ${label === "Subtotal" ? "pt-2" : ""} ${
                                            label === "Tax total" ? "border-b py-2 pb-4" : ""
                                        } ${label === "Total" ? "pt-2 text-lg font-bold" : ""}`}
                                    >
                                        <span className={label === "Total" ? "" : "text-muted-foreground font-medium"}>{label}</span>
                                        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-label="Calculating" />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-xl border p-6 shadow-sm">
                    <p className="text-muted-foreground mb-6 text-xs">
                        Your personal data will be used to process your order, support your experience throughout this website, and for other
                        purposes described in our privacy policy.
                    </p>
                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || !totals || calculateQuery.isError}
                        className="h-12 w-full rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" /> Placing order…
                            </>
                        ) : (
                            <>
                                Place Order <ArrowUpRight className="ml-2 size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Form>
    );
}
