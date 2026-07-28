import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteMyAddress } from "@/hooks/api/iam/use-addresses";

export function AddressDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.addressDelete;

    const deleteAddress = useDeleteMyAddress(data?.addressId ?? 0);

    const handleDelete = () => {
        deleteAddress.mutate({}, { onSuccess: () => closeModal("addressDelete") });
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

                {deleteAddress.isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {deleteAddress.error.message}
                    </p>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("addressDelete")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteAddress.isPending || data?.addressId == null}>
                        {deleteAddress.isPending ? "Deleting..." : "Yes, Delete Address"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
