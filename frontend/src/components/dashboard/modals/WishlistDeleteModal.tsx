import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { removeFromWishlistVariables, useRemoveFromWishlist } from "@/hooks/api/wishlist/use-wishlist-mutations";

export function WishlistDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.wishlistDelete;
    const removeFromWishlist = useRemoveFromWishlist();

    const onClose = () => closeModal("wishlistDelete");

    const handleDelete = () => {
        if (data?.cid == null) return;

        removeFromWishlist.mutate(removeFromWishlistVariables(data.cid), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove from Wishlist</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to remove{" "}
                        {data?.itemName ? <span className="text-foreground font-semibold">"{data.itemName}"</span> : "this item"} from your
                        wishlist?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose} disabled={removeFromWishlist.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={removeFromWishlist.isPending || data?.cid == null}>
                        {removeFromWishlist.isPending ? "Removing..." : "Yes, Remove"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
