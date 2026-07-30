import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteProfile } from "@/hooks/api/iam/use-profile";

export function ProfileDeleteModal() {
    const navigate = useNavigate();
    const { modals, closeModal } = useUiStore();
    const { isOpen } = modals.profileDelete;
    const deleteProfile = useDeleteProfile();
    const [currentPassword, setCurrentPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const resetForm = () => {
        setCurrentPassword("");
        setPasswordError(null);
    };

    const onClose = () => {
        if (deleteProfile.isPending) return;
        resetForm();
        closeModal("profileDelete");
    };

    const handleDelete = () => {
        const password = currentPassword.trim();
        if (!password) {
            setPasswordError("Current password is required.");
            return;
        }

        setPasswordError(null);
        deleteProfile.mutate(
            { body: { current_password: password } },
            {
                onSuccess: () => {
                    resetForm();
                    closeModal("profileDelete");
                    void navigate({ to: "/" });
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete account</DialogTitle>
                    <DialogDescription>
                        This deactivates your account and signs you out. You will not be able to sign in with this account again. Enter your current
                        password to confirm.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2 py-2">
                    <Label htmlFor="delete_account_password">Current password</Label>
                    <Input
                        id="delete_account_password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(event) => {
                            setCurrentPassword(event.target.value);
                            if (passwordError) setPasswordError(null);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                handleDelete();
                            }
                        }}
                        disabled={deleteProfile.isPending}
                    />
                    {passwordError && <p className="text-destructive text-sm font-medium">{passwordError}</p>}
                </div>

                {deleteProfile.isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {deleteProfile.error.message}
                    </p>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={deleteProfile.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteProfile.isPending}>
                        {deleteProfile.isPending ? "Deleting..." : "Yes, delete account"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
