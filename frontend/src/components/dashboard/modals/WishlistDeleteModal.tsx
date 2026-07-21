import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function WishlistDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.wishlistDelete;

    const handleDelete = () => {
        console.log("Removing from Wishlist CID:", data?.cid);
        // TODO: logic
        closeModal("wishlistDelete");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("wishlistDelete")}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remove from Wishlist</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove{" "}
                        {data?.itemName ? <span className="text-foreground font-semibold">"{data.itemName}"</span> : "this item"} from your wishlist?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("wishlistDelete")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Yes, Remove
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
