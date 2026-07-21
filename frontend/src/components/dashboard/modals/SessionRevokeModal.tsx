import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SessionRevokeModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.sessionRevoke;

    const handleRevoke = () => {
        console.log("Revoking session:", data?.sessionId);
        // Call backend mutation logic here...
        closeModal("sessionRevoke");
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
                    <Button variant="outline" onClick={() => closeModal("sessionRevoke")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRevoke}>
                        Sign Out Device
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
