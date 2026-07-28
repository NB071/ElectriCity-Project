import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteAdminReviewVariables, useDeleteAdminReview } from "@/hooks/api/review/use-review-mutations";

export function ReviewDeleteModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.reviewDelete;
    const deleteReview = useDeleteAdminReview();

    const handleDelete = () => {
        if (data?.reviewId == null) return;
        deleteReview.mutate(deleteAdminReviewVariables(data.reviewId), {
            onSuccess: () => closeModal("reviewDelete"),
        });
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

                {deleteReview.isError && (
                    <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                        {deleteReview.error.message}
                    </p>
                )}

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => closeModal("reviewDelete")}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={deleteReview.isPending || data?.reviewId == null}>
                        {deleteReview.isPending ? "Deleting..." : "Yes, Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
