import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { loginSchema } from "@/zod/auth";

export const Route = createFileRoute("/auth/_layout/login")({
    component: LoginForm,
});

// TODO: Implement actual login logic
// TODO: redirect to correct dashboard based on role!

function LoginForm({ className, ...props }: Omit<React.ComponentProps<"form">, "onSubmit">) {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: toFormikValidationSchema(loginSchema),
        onSubmit: (values) => {
            // Proceed with validated values...
            navigate({ to: "/dashboard" });
        },
    });

    return (
        <form className={cn("flex flex-col gap-6", className)} onSubmit={formik.handleSubmit} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Login to your account</h1>
                    <p className="text-muted-foreground text-sm text-balance">Enter your email below to login to your account</p>
                </div>
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john.doe@yorku.ca"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                        className={formik.touched.email && formik.errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {formik.touched.email && formik.errors.email && <span className="text-destructive text-sm">{formik.errors.email}</span>}
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
                    <Button type="submit">Login</Button>
                </Field>
                <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link to="/auth/register" className="underline underline-offset-4">
                        Sign Up
                    </Link>
                </FieldDescription>
            </FieldGroup>
        </form>
    );
}
