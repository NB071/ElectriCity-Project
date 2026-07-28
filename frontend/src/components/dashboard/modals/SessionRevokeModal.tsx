import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRevokeSession, revokeSessionVariables } from "@/hooks/api/iam/use-sessions";

export function SessionRevokeModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.sessionRevoke;
    const revokeSession = useRevokeSession();

    const handleRevoke = () => {
        if (!data?.sessionId) return;

        revokeSession.mutate(revokeSessionVariables(data.sessionId), {
            onSettled: () => closeModal("sessionRevoke"),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("sessionRevoke")}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Revoke Session</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out {data?.label ? `"${data.label}"` : "this device"}? They will be logged out immediately.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("sessionRevoke")} disabled={revokeSession.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRevoke} disabled={revokeSession.isPending || !data?.sessionId}>
                        {revokeSession.isPending ? "Signing out..." : "Sign Out Device"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
