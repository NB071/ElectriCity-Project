import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function SessionRevokeAllModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen } = modals.sessionRevokeAll;

    const handleRevokeAll = () => {
        console.log("Revoking all other sessions.");
        // Call backend mutation logic here...
        closeModal("sessionRevokeAll");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("sessionRevokeAll")}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center pb-2 text-center sm:items-center">
                    <div className="bg-destructive/10 mb-3 rounded-full p-3">
                        <AlertTriangle className="text-destructive h-6 w-6" />
                    </div>
                    <DialogTitle>Sign out of all other devices</DialogTitle>
                    <DialogDescription className="pt-2 text-center">
                        This action will immediately invalidate all your active sessions on all other browsers and devices. You will only remain
                        logged in on this current device.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 w-full gap-2 sm:justify-center sm:space-x-0">
                    <Button variant="outline" onClick={() => closeModal("sessionRevokeAll")} className="flex-1">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleRevokeAll} className="flex-1">
                        Sign Out All
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
