import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ReviewDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.reviewDelete;

    const handleDelete = () => {
        console.log("Deleting Review ID:", data?.reviewId);
        // TODO: logic
        closeModal("reviewDelete");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("reviewDelete")}>
            <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Review</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete{" "}
                        {data?.reviewTitle ? <span className="text-foreground font-semibold">"{data.reviewTitle}"</span> : "this"} review? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("reviewDelete")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        Yes, Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
