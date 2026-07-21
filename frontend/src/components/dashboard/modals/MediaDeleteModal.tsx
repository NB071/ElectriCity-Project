import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function MediaDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaDelete;

    const onClose = () => closeModal("mediaDelete");

    const handleDelete = () => {
        if (!config.data?.mediaId) return;
        console.log("Deleted mediaId:", config.data.mediaId);
        // TODO: logic

        onClose();
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Media Asset</DialogTitle>
                    <DialogDescription>
                        Are you absolutely sure you want to delete this asset? This action cannot be undone and will break any references across the
                        platform.
                        {config.data?.label && <div className="text-foreground mt-2 font-medium">Asset: {config.data.label}</div>}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Delete Asset
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
