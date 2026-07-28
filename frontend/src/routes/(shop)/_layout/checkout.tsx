import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { getCheckoutSchema, type CheckoutFormValues } from "@/zod/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Circle, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import { useAuthStatus } from "@/hooks/use-me";
import { useCheckoutDraftStore } from "@/stores";
import { CreditCardVisual } from "@/components/ui/credit-card";
import { MOCK_ITEMS, resolveUnitPrice } from "@/lib/mock-cart";
export const Route = createFileRoute("/(shop)/_layout/checkout")({
    component: CheckoutPage,
});

function CheckoutPage() {
    const navigate = useNavigate();
    const isGuest = useAuthStatus().status === "guest";
    const setDraft = useCheckoutDraftStore((s) => s.setDraft);
    const setCheckoutProgress = useCheckoutDraftStore((s) => s.setCheckoutProgress);
    const activeStep = useCheckoutDraftStore((s) => s.activeStep);
    const maxLevel = useCheckoutDraftStore((s) => s.maxLevel);
    const [initialDraft] = useState(() => useCheckoutDraftStore.getState().draft);

    const initialValues: CheckoutFormValues = {
        ...initialDraft,
        card_number: "",
        expiry_month: "",
        expiry_year: "",
        cvv: "",
        cardholder_name: "",
    } as CheckoutFormValues;

    const handleSubmit = (values: CheckoutFormValues) => {
        console.log("Submitting Order...", values);
        // Payment submission and order creation logic will be implemented here
        navigate({ to: "/checkout-success" });
    };

    const subtotal = MOCK_ITEMS.reduce((sum, item) => sum + resolveUnitPrice(item) * item.quantity, 0);
    const shipping = 1200;
    const finalTotal = subtotal + shipping;

    return (
        <div className="mx-auto mt-18 w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
                <Breadcrumbs />
                <h1 className="mt-4 text-4xl font-bold tracking-tight">Shop Checkout</h1>
            </div>

            <Formik initialValues={initialValues} validationSchema={toFormikValidationSchema(getCheckoutSchema(isGuest))} onSubmit={handleSubmit}>
                {({ values, setFieldValue, setTouched, errors, touched, validateForm }) => {
                    useEffect(() => {
                        const { card_number, expiry_month, expiry_year, cvv, cardholder_name, ...draftValues } = values;
                        setDraft(draftValues);
                    }, [values, setDraft]);

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

                    return (
                        <Form className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
                            {/* Billing Details (Left Column) */}
                            <div className="lg:col-span-7">
                                <Accordion
                                    type="single"
                                    value={activeStep}
                                    onValueChange={(val) => {
                                        if (!val) return;
                                        const level = val === "personal" ? 0 : val === "shipping" ? 1 : 2;
                                        if (level <= currentMaxLevel) setCheckoutProgress(val, maxLevel);
                                    }}
                                    className="space-y-4"
                                >
                                    {/* Step 1: Personal Details */}
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
                                        <AccordionContent className="space-y-4 pt-2 pb-6">
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="firstName"
                                                        className={
                                                            errors.firstName && touched.firstName ? "text-destructive" : "text-muted-foreground"
                                                        }
                                                    >
                                                        First Name *
                                                    </Label>
                                                    <Field as={Input} id="firstName" name="firstName" placeholder="First Name" />
                                                    <ErrorMessage name="firstName" component="div" className="text-destructive text-xs" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="lastName"
                                                        className={errors.lastName && touched.lastName ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        Last Name *
                                                    </Label>
                                                    <Field as={Input} id="lastName" name="lastName" placeholder="Last Name" />
                                                    <ErrorMessage name="lastName" component="div" className="text-destructive text-xs" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="email"
                                                        className={errors.email && touched.email ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        Email Address {isGuest && "*"}
                                                    </Label>
                                                    <Field as={Input} id="email" name="email" type="email" placeholder="Email address" />
                                                    <ErrorMessage name="email" component="div" className="text-destructive text-xs" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="phone"
                                                        className={errors.phone && touched.phone ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        Phone
                                                    </Label>
                                                    <Field as={Input} id="phone" name="phone" placeholder="Phone" />
                                                    <ErrorMessage name="phone" component="div" className="text-destructive text-xs" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="street"
                                                    className={errors.street && touched.street ? "text-destructive" : "text-muted-foreground"}
                                                >
                                                    Mailing Address *
                                                </Label>
                                                <Field as={Input} id="street" name="street" placeholder="Mailing Address" />
                                                <ErrorMessage name="street" component="div" className="text-destructive text-xs" />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="city"
                                                        className={errors.city && touched.city ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        City *
                                                    </Label>
                                                    <Field as={Input} id="city" name="city" placeholder="City" />
                                                    <ErrorMessage name="city" component="div" className="text-destructive text-xs" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="postal_code"
                                                        className={
                                                            errors.postal_code && touched.postal_code ? "text-destructive" : "text-muted-foreground"
                                                        }
                                                    >
                                                        Post Code *
                                                    </Label>
                                                    <Field as={Input} id="postal_code" name="postal_code" placeholder="Post Code" />
                                                    <ErrorMessage name="postal_code" component="div" className="text-destructive text-xs" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="country"
                                                        className={errors.country && touched.country ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        Country *
                                                    </Label>
                                                    <Field as={Input} id="country" name="country" placeholder="Country" />
                                                    <ErrorMessage name="country" component="div" className="text-destructive text-xs" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="province"
                                                        className={errors.province && touched.province ? "text-destructive" : "text-muted-foreground"}
                                                    >
                                                        Region/State *
                                                    </Label>
                                                    <Field as={Input} id="province" name="province" placeholder="Select a state" />
                                                    <ErrorMessage name="province" component="div" className="text-destructive text-xs" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="companyName" className="text-muted-foreground">
                                                    Company Name (optional)
                                                </Label>
                                                <Field as={Input} id="companyName" name="companyName" placeholder="Company Name" />
                                            </div>

                                            <div className="pt-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="text-secondary-foreground hover:bg-secondary/80 px-8"
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
                                                            true
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

                                    {/* Step 2: Shipping Address */}
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
                                        <AccordionContent className="text-muted-foreground space-y-4 pt-2 pb-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="sameAsPersonal"
                                                    checked={values.sameAsPersonal}
                                                    onChange={(e) => setFieldValue("sameAsPersonal", e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <label htmlFor="sameAsPersonal">Same as personal details</label>
                                            </div>

                                            {!values.sameAsPersonal && (
                                                <div className="text-foreground space-y-4 pt-4">
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="shipping_street"
                                                            className={
                                                                errors.shipping_street && touched.shipping_street
                                                                    ? "text-destructive"
                                                                    : "text-muted-foreground"
                                                            }
                                                        >
                                                            Mailing Address *
                                                        </Label>
                                                        <Field as={Input} id="shipping_street" name="shipping_street" placeholder="Mailing Address" />
                                                        <ErrorMessage name="shipping_street" component="div" className="text-destructive text-xs" />
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="shipping_city"
                                                                className={
                                                                    errors.shipping_city && touched.shipping_city
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                City *
                                                            </Label>
                                                            <Field as={Input} id="shipping_city" name="shipping_city" placeholder="City" />
                                                            <ErrorMessage name="shipping_city" component="div" className="text-destructive text-xs" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="shipping_postal_code"
                                                                className={
                                                                    errors.shipping_postal_code && touched.shipping_postal_code
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                Post Code *
                                                            </Label>
                                                            <Field
                                                                as={Input}
                                                                id="shipping_postal_code"
                                                                name="shipping_postal_code"
                                                                placeholder="Post Code"
                                                            />
                                                            <ErrorMessage
                                                                name="shipping_postal_code"
                                                                component="div"
                                                                className="text-destructive text-xs"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="shipping_country"
                                                                className={
                                                                    errors.shipping_country && touched.shipping_country
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                Country *
                                                            </Label>
                                                            <Field as={Input} id="shipping_country" name="shipping_country" placeholder="Country" />
                                                            <ErrorMessage
                                                                name="shipping_country"
                                                                component="div"
                                                                className="text-destructive text-xs"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="shipping_province"
                                                                className={
                                                                    errors.shipping_province && touched.shipping_province
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                Region/State *
                                                            </Label>
                                                            <Field
                                                                as={Input}
                                                                id="shipping_province"
                                                                name="shipping_province"
                                                                placeholder="Select a state"
                                                            />
                                                            <ErrorMessage
                                                                name="shipping_province"
                                                                component="div"
                                                                className="text-destructive text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className="text-secondary-foreground hover:bg-secondary/80 px-8"
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
                                                            true
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

                                    {/* Step 3: Payment Info */}
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
                                        <AccordionContent className="space-y-4 pt-2 pb-6">
                                            <div className="space-y-4 text-sm">
                                                <label className="flex cursor-pointer items-start gap-3">
                                                    <div className="mt-0.5">
                                                        {values.paymentMethod === "credit" ? (
                                                            <CheckCircle2 className="text-primary size-5" />
                                                        ) : (
                                                            <Circle
                                                                className="text-muted-foreground size-5"
                                                                onClick={() => setFieldValue("paymentMethod", "credit")}
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span
                                                            className={`font-semibold ${values.paymentMethod === "credit" ? "text-foreground" : "text-muted-foreground"} cursor-pointer`}
                                                            onClick={() => setFieldValue("paymentMethod", "credit")}
                                                        >
                                                            Credit Card
                                                        </span>
                                                        {values.paymentMethod === "credit" && (
                                                            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                                                                Pay securely with your Visa, MasterCard, or Amex.
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>

                                                <label className="flex cursor-pointer items-center gap-3">
                                                    {values.paymentMethod === "debit" ? (
                                                        <CheckCircle2 className="text-primary size-5" />
                                                    ) : (
                                                        <Circle
                                                            className="text-muted-foreground size-5"
                                                            onClick={() => setFieldValue("paymentMethod", "debit")}
                                                        />
                                                    )}
                                                    <span
                                                        className={`font-semibold ${values.paymentMethod === "debit" ? "text-foreground" : "text-muted-foreground"} cursor-pointer`}
                                                        onClick={() => setFieldValue("paymentMethod", "debit")}
                                                    >
                                                        Debit Card
                                                    </span>
                                                </label>

                                                <label className="flex cursor-pointer items-center gap-3">
                                                    {values.paymentMethod === "apple_pay" ? (
                                                        <CheckCircle2 className="text-primary size-5" />
                                                    ) : (
                                                        <Circle
                                                            className="text-muted-foreground size-5"
                                                            onClick={() => setFieldValue("paymentMethod", "apple_pay")}
                                                        />
                                                    )}
                                                    <span
                                                        className={`font-semibold ${values.paymentMethod === "apple_pay" ? "text-foreground" : "text-muted-foreground"} cursor-pointer`}
                                                        onClick={() => setFieldValue("paymentMethod", "apple_pay")}
                                                    >
                                                        Apple Pay
                                                    </span>
                                                </label>

                                                {(values.paymentMethod === "credit" || values.paymentMethod === "debit") && (
                                                    <div className="mt-4 space-y-4 border-t pt-4">
                                                        <div className="mb-6">
                                                            {/* credit: https://www.shadcn-form.com/components/credit-card */}
                                                            <CreditCardVisual
                                                                cardNumber={values.card_number}
                                                                cardHolder={values.cardholder_name}
                                                                expiresMonth={values.expiry_month}
                                                                expiresYear={values.expiry_year}
                                                                cvc={values.cvv}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="card_number"
                                                                className={
                                                                    errors.card_number && touched.card_number
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                Card Number *
                                                            </Label>
                                                            <Field
                                                                as={Input}
                                                                id="card_number"
                                                                name="card_number"
                                                                placeholder="0000 0000 0000 0000"
                                                                maxLength={22}
                                                            />
                                                            <ErrorMessage name="card_number" component="div" className="text-destructive text-xs" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor="cardholder_name"
                                                                className={
                                                                    errors.cardholder_name && touched.cardholder_name
                                                                        ? "text-destructive"
                                                                        : "text-muted-foreground"
                                                                }
                                                            >
                                                                Name on Card *
                                                            </Label>
                                                            <Field
                                                                as={Input}
                                                                id="cardholder_name"
                                                                name="cardholder_name"
                                                                placeholder="John Doe"
                                                                maxLength={30}
                                                            />
                                                            <ErrorMessage
                                                                name="cardholder_name"
                                                                component="div"
                                                                className="text-destructive text-xs"
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor="expiry_month"
                                                                    className={
                                                                        errors.expiry_month && touched.expiry_month
                                                                            ? "text-destructive"
                                                                            : "text-muted-foreground"
                                                                    }
                                                                >
                                                                    MM *
                                                                </Label>
                                                                <Field
                                                                    as={Input}
                                                                    id="expiry_month"
                                                                    name="expiry_month"
                                                                    placeholder="MM"
                                                                    maxLength={2}
                                                                />
                                                                <ErrorMessage
                                                                    name="expiry_month"
                                                                    component="div"
                                                                    className="text-destructive text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor="expiry_year"
                                                                    className={
                                                                        errors.expiry_year && touched.expiry_year
                                                                            ? "text-destructive"
                                                                            : "text-muted-foreground"
                                                                    }
                                                                >
                                                                    YY *
                                                                </Label>
                                                                <Field
                                                                    as={Input}
                                                                    id="expiry_year"
                                                                    name="expiry_year"
                                                                    placeholder="YY"
                                                                    maxLength={2}
                                                                />
                                                                <ErrorMessage
                                                                    name="expiry_year"
                                                                    component="div"
                                                                    className="text-destructive text-xs"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor="cvv"
                                                                    className={
                                                                        errors.cvv && touched.cvv ? "text-destructive" : "text-muted-foreground"
                                                                    }
                                                                >
                                                                    CVV *
                                                                </Label>
                                                                <Field
                                                                    as={Input}
                                                                    id="cvv"
                                                                    name="cvv"
                                                                    placeholder="123"
                                                                    type="password"
                                                                    maxLength={4}
                                                                />
                                                                <ErrorMessage name="cvv" component="div" className="text-destructive text-xs" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <ErrorMessage name="paymentMethod" component="div" className="text-destructive text-xs" />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>

                                <div className="text-foreground mt-8 space-y-2">
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

                            {/* Order Summary & Pay (Right Column) */}
                            <div className="space-y-6 lg:col-span-5">
                                {/* Order Box */}
                                <div className="bg-card rounded-xl border p-6 shadow-sm">
                                    <h3 className="mb-4 text-lg font-semibold">Your order</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="text-muted-foreground flex justify-between border-b pb-4 font-medium">
                                            <span>Product</span>
                                            <span>Subtotal</span>
                                        </div>

                                        <div className="custom-scrollbar max-h-[40vh] overflow-y-auto pr-2">
                                            {MOCK_ITEMS.map((item) => (
                                                <div key={item.id} className="flex flex-col border-b py-2 pb-4">
                                                    <div className="flex justify-between pb-1">
                                                        <span className="text-primary cursor-pointer hover:underline">
                                                            {item.name}{" "}
                                                            <span className="text-muted-foreground text-xs md:text-sm">x {item.quantity}</span>
                                                        </span>
                                                        <span className="text-foreground font-medium">
                                                            $
                                                            {(resolveUnitPrice(item) * item.quantity).toLocaleString(undefined, {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>
                                                    {item.configuration && item.configuration.options.length > 0 && (
                                                        <div className="text-muted-foreground mt-1 flex flex-col gap-1.5 pl-2 text-xs">
                                                            {item.configuration.options.map((opt, i) => (
                                                                <div key={i} className="flex justify-between pr-4">
                                                                    <span>
                                                                        - {opt.category_name}: {opt.name}
                                                                    </span>
                                                                    <span className="text-muted-foreground/70 text-[10px]">
                                                                        (+${opt.price_delta.toLocaleString()})
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <span className="text-muted-foreground font-medium">Subtotal</span>
                                            <span className="font-semibold">
                                                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b py-2 pb-4">
                                            <span className="text-muted-foreground font-medium">Shipping</span>
                                            <span className="font-semibold">
                                                ${shipping.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 text-lg font-bold">
                                            <span>Total</span>
                                            <span>
                                                ${finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card rounded-xl border p-6 shadow-sm">
                                    <p className="text-muted-foreground mb-6 text-xs">
                                        Your personal data will be used to process your order, support your experience throughout this website, and
                                        for other purposes described in our privacy policy.
                                    </p>
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="h-12 w-full rounded-lg bg-blue-600 font-medium text-white hover:bg-blue-700"
                                    >
                                        Place Order <ArrowUpRight className="ml-2 size-4" />
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}
