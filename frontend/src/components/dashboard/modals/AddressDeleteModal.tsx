import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AddressDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.addressDelete;

    const handleDelete = () => {
        console.log("Deleting address ID:", data?.addressId);
        closeModal("addressDelete");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("addressDelete")}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Address</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {data?.label ? `"${data.label}"` : "this address"}? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("addressDelete")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Yes, Delete Address
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
