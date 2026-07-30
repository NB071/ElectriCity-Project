import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function PasswordSuccessModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen } = modals.passwordSuccess;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal("passwordSuccess")}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center pb-2 text-center sm:items-center">
                    <CheckCircle2 className="text-primary mb-2 h-10 w-10" />
                    <DialogTitle className="text-xl">Password Updated</DialogTitle>
                    <DialogDescription className="text-center">
                        Your password has been successfully changed. Please use your new password the next time you log in.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-2 sm:justify-center">
                    <Button onClick={() => closeModal("passwordSuccess")}>Okay, got it!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
