import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useLogoutAll } from "@/hooks/api/iam/use-auth";

export function SessionRevokeAllModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen } = modals.sessionRevokeAll;
    const navigate = useNavigate();
    const logoutAll = useLogoutAll();

    const handleRevokeAll = () => {
        logoutAll.mutate(
            {},
            {
                onSettled: () => {
                    closeModal("sessionRevokeAll");
                    navigate({ to: "/auth/login" });
                },
            }
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("sessionRevokeAll")}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center pb-2 text-center sm:items-center">
                    <div className="bg-destructive/10 mb-3 rounded-full p-3">
                        <AlertTriangle className="text-destructive h-6 w-6" />
                    </div>
                    <DialogTitle>Sign out of all devices</DialogTitle>
                    <DialogDescription className="pt-2 text-center">
                        This action will immediately invalidate all your active sessions on every browser and device — including this one. You will
                        need to log in again to continue.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 w-full gap-2 sm:justify-center sm:space-x-0">
                    <Button variant="outline" onClick={() => closeModal("sessionRevokeAll")} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRevokeAll} disabled={logoutAll.isPending} className="flex-1">
                        {logoutAll.isPending ? "Signing out…" : "Sign Out All"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
