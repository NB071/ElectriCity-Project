import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { useMe } from "@/hooks/use-me";
import { useUpdateProfile } from "@/hooks/api/iam/use-profile";
import { accountFormSchema, type AccountFormValues } from "@/zod/profile";

export const Route = createFileRoute("/dashboard/_layout/settings/profile")({
    component: RouteComponent,
});

// --- Validation ---
const validateWithZod = (schema: z.ZodSchema) => (values: AccountFormValues) => {
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
    const { data: user, isPending } = useMe();
    const updateProfile = useUpdateProfile();

    const formik = useFormik<AccountFormValues>({
        initialValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            email: user?.email || "",
            phone_number: user?.phone_number || "",
        },
        validate: validateWithZod(accountFormSchema),
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            const changed: Record<string, string | null> = {};
            if (values.first_name !== user?.first_name) changed.first_name = values.first_name;
            if (values.last_name !== user?.last_name) changed.last_name = values.last_name;
            if (values.email !== user?.email) changed.email = values.email;
            if ((values.phone_number || "") !== (user?.phone_number || "")) {
                changed.phone_number = values.phone_number ? values.phone_number : null;
            }

            if (Object.keys(changed).length === 0) {
                setSubmitting(false);
                return;
            }

            updateProfile.mutate({ body: changed }, { onSettled: () => setSubmitting(false) });
        },
    });

    if (isPending) {
        return <p className="text-muted-foreground text-sm">Loading your profile...</p>;
    }

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8">
            {updateProfile.isError && (
                <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                    {updateProfile.error.message}
                </p>
            )}
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

            <Button type="submit" disabled={updateProfile.isPending || !formik.dirty}>
                {updateProfile.isPending ? "Saving..." : "Update account"}
            </Button>
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
