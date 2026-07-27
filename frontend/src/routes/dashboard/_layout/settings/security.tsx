import { createFileRoute } from "@tanstack/react-router";
import { Laptop, Smartphone } from "lucide-react";
import { useFormik } from "formik";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { useUiStore } from "@/stores/ui-store";
import { useUpdateProfile } from "@/hooks/api/iam/use-profile";
import { useGetSessions } from "@/hooks/api/iam/use-sessions";

export const Route = createFileRoute("/dashboard/_layout/settings/security")({
    component: RouteComponent,
});

const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, "Current password is required."),
        new_password: z.string().min(8, "Password must be at least 8 characters.").max(100, "Password is too long."),
        confirm_password: z.string().min(1, "Please confirm your new password."),
    })
    .refine((values) => values.new_password === values.confirm_password, {
        message: "Passwords do not match.",
        path: ["confirm_password"],
    });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const validateWithZod = (schema: z.ZodSchema) => (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
        errors[String(issue.path[0])] = issue.message;
    });
    return errors;
};

function ChangePasswordForm() {
    const { openModal } = useUiStore();
    const updateProfile = useUpdateProfile();

    const formik = useFormik<ChangePasswordValues>({
        initialValues: { current_password: "", new_password: "", confirm_password: "" },
        validate: validateWithZod(changePasswordSchema),
        onSubmit: (values, { setSubmitting, resetForm }) => {
            updateProfile.mutate(
                { body: { current_password: values.current_password, new_password: values.new_password } },
                {
                    onSuccess: () => {
                        resetForm();
                        openModal("passwordSuccess");
                    },
                    onSettled: () => setSubmitting(false),
                }
            );
        },
    });

    return (
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
            {updateProfile.isError && (
                <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                    {updateProfile.error.message}
                </p>
            )}
            <div className="grid gap-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                    id="current_password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    {...formik.getFieldProps("current_password")}
                />
                {formik.touched.current_password && formik.errors.current_password && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.current_password}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                    id="new_password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    {...formik.getFieldProps("new_password")}
                />
                {formik.touched.new_password && formik.errors.new_password && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.new_password}</p>
                )}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                    id="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    {...formik.getFieldProps("confirm_password")}
                />
                {formik.touched.confirm_password && formik.errors.confirm_password && (
                    <p className="text-destructive text-sm font-medium">{formik.errors.confirm_password}</p>
                )}
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Updating…" : "Update password"}
            </Button>
        </form>
    );
}

function SessionManagement() {
    const { openModal } = useUiStore();
    const { data: sessions, isPending, isError, error } = useGetSessions();

    if (isPending) {
        return <p className="text-muted-foreground text-sm">Loading your active sessions…</p>;
    }

    if (isError) {
        return (
            <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                {error.message}
            </p>
        );
    }

    return (
        <div className="space-y-6">
            {sessions.length === 0 && <p className="text-muted-foreground text-sm">No active sessions found.</p>}
            {sessions.map((session) => (
                <div key={session.session_id} className="border-border bg-card flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                        {/(iPhone|Android|Mobile)/i.test(session.device_label ?? session.user_agent ?? "") ? (
                            <Smartphone className="text-muted-foreground h-6 w-6" />
                        ) : (
                            <Laptop className="text-muted-foreground h-6 w-6" />
                        )}
                        <div>
                            <p className="text-sm font-medium">
                                {session.device_label || session.user_agent || "Unknown Device"}
                                {session.is_current && <span className="text-primary ml-2 text-xs font-bold">(Current Device)</span>}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                IP: {session.ip_address ?? "unknown"} • Last active: {new Date(session.last_seen_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="border-t pt-4">
                Revoking a single other device is deliberately absent: the backend only exposes "logout" (current session) and "logout-all" (every
                session). Sign-out-all therefore ends this session too and drops the user back on the login page.
                <Button variant="destructive" className="w-full sm:w-auto" onClick={() => openModal("sessionRevokeAll")}>
                    Sign out of all devices
                </Button>
                <p className="text-muted-foreground mt-2 text-xs">This signs you out everywhere, including this device.</p>
            </div>
        </div>
    );
}

function RouteComponent() {
    return (
        <ContentSection title="Security" desc="Manage your password and active sessions">
            <div className="space-y-12">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-foreground text-lg font-medium">Change Password</h3>
                        <p className="text-muted-foreground text-[0.8rem] font-normal">Update your password to keep your account secure.</p>
                    </div>
                    <ChangePasswordForm />
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-foreground text-lg font-medium">Active Sessions</h3>
                        <p className="text-muted-foreground text-[0.8rem] font-normal">
                            Manage the devices and locations where you are currently signed in.
                        </p>
                    </div>
                    <SessionManagement />
                </div>
            </div>
        </ContentSection>
    );
}
