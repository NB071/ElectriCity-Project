import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { useAuthStore } from "@/stores/auth-store";
import { accountFormSchema, type AccountFormValues } from "@/zod/profile";

export const Route = createFileRoute("/dashboard/_layout/settings/profile")({
    component: RouteComponent,
});

// --- Validation ---
const validateWithZod = (schema: z.ZodSchema) => (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        errors[key] = issue.message;
    });
    return errors;
};

// --- Subcomponents ---

function AccountForm() {
    const { user } = useAuthStore();

    const formik = useFormik<AccountFormValues>({
        initialValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            email: user?.email || "",
            phone_number: user?.phone_number || "",
        },
        validate: validateWithZod(accountFormSchema),
        enableReinitialize: true,
        onSubmit: (values) => {
            console.log("Submitting account updates...", values);
            // TODO: integrate backend mutation for account update
        },
    });

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8">
            <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" placeholder="Your first name" {...formik.getFieldProps("first_name")} />
                {formik.touched.first_name && formik.errors.first_name && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.first_name}</p>
                )}
                <p className="text-muted-foreground text-[0.8rem]">This is your legal first name.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" placeholder="Your last name" {...formik.getFieldProps("last_name")} />
                {formik.touched.last_name && formik.errors.last_name && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.last_name}</p>
                )}
                <p className="text-muted-foreground text-[0.8rem]">This is your legal last name.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Your email address" {...formik.getFieldProps("email")} />
                {formik.touched.email && formik.errors.email && <p className="text-destructive text-sm font-medium">{formik.errors.email}</p>}
                <p className="text-muted-foreground text-[0.8rem]">Your email address used for login and notifications.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" placeholder="Your phone number" {...formik.getFieldProps("phone_number")} />
                {formik.touched.phone_number && formik.errors.phone_number && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.phone_number}</p>
                )}
            </div>

            <Button type="submit">Update account</Button>
        </form>
    );
}

function RouteComponent() {
    return (
        <ContentSection title="Profile" desc="Manage your personal information">
            <div className="space-y-12">
                <AccountForm />
            </div>
        </ContentSection>
    );
}
