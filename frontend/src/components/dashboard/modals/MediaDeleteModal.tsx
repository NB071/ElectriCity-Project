import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteAdminMediaVariables, useDeleteAdminMedia } from "@/hooks/api/media/use-admin-media";

export function MediaDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const config = modals.mediaDelete;
    const deleteMedia = useDeleteAdminMedia();

    const onClose = () => closeModal("mediaDelete");

    const handleDelete = () => {
        if (!config.data?.mediaId) {
            return;
        }

        deleteMedia.mutate(deleteAdminMediaVariables(config.data.mediaId), {
            onSettled: () => onClose(),
        });
    };

    return (
        <Dialog open={config.isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Media Asset</DialogTitle>
                    <DialogDescription>
                        Are you absolutely sure you want to delete this asset? This action cannot be undone and will break any references across the
                        platform.
                        {config.data?.label ? <div className="text-foreground mt-2 font-medium">Asset: {config.data.label}</div> : null}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={deleteMedia.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteMedia.isPending || !config.data?.mediaId}>
                        {deleteMedia.isPending ? "Deleting..." : "Delete Asset"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
