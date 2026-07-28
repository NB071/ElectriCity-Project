import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { registerSchema } from "@/zod/auth";
import { useLogin, useRegister } from "@/hooks/api/iam/use-auth";
import { dashboardHomeFor, ensureAuthUser } from "@/lib/auth";

export const Route = createFileRoute("/auth/_layout/register")({
    beforeLoad: async ({ context }) => {
        const user = await ensureAuthUser(context.queryClient);
        if (user) {
            throw redirect({ to: dashboardHomeFor(user) });
        }
    },
    component: RegisterForm,
});

function RegisterForm({ className, ...props }: Omit<React.ComponentProps<"form">, "onSubmit">) {
    const navigate = useNavigate();
    const register = useRegister();
    const login = useLogin();

    const submitError = register.error?.message ?? login.error?.message;
    const isSubmitting = register.isPending || login.isPending;

    const formik = useFormik({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            password: "",
        },
        validationSchema: toFormikValidationSchema(registerSchema),
        onSubmit: (values, { setSubmitting }) => {
            register.mutate(
                {
                    body: {
                        first_name: values.firstName,
                        last_name: values.lastName,
                        email: values.email,
                        password: values.password,
                        phone_number: values.phone ? values.phone : null,
                    },
                },
                {
                    onSuccess: () => {
                        login.mutate(
                            { body: { email: values.email, password: values.password } },
                            {
                                onSuccess: (data) => navigate({ to: dashboardHomeFor(data.user) }),
                                onError: () => navigate({ to: "/auth/login" }),
                                onSettled: () => setSubmitting(false),
                            }
                        );
                    },
                    onError: () => setSubmitting(false),
                }
            );
        },
    });

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={formik.handleSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground text-sm text-balance">Enter your details below to register for a new account</p>
                </div>
                {submitError && (
                    <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {submitError}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.firstName}
                            className={formik.touched.firstName && formik.errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {formik.touched.firstName && formik.errors.firstName && (
                            <span className="text-destructive text-sm">{formik.errors.firstName}</span>
                        )}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.lastName}
                            className={formik.touched.lastName && formik.errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {formik.touched.lastName && formik.errors.lastName && (
                            <span className="text-destructive text-sm">{formik.errors.lastName}</span>
                        )}
                    </Field>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        className={formik.touched.email && formik.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {formik.touched.email && formik.errors.email && <span className="text-destructive text-sm">{formik.errors.email}</span>}
                </Field>
                <Field>
                    <FieldLabel htmlFor="phone">
                        Phone Number <span className="text-muted-foreground font-normal">(Optional)</span>
                    </FieldLabel>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.phone}
                        className={formik.touched.phone && formik.errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {formik.touched.phone && formik.errors.phone && <span className="text-destructive text-sm">{formik.errors.phone}</span>}
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        className={formik.touched.password && formik.errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {formik.touched.password && formik.errors.password && <span className="text-destructive text-sm">{formik.errors.password}</span>}
                </Field>
                <Field>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Register"}
                    </Button>
                </Field>
                <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link to="/auth/login" className="underline underline-offset-4">
                        Sign In
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    );
}
