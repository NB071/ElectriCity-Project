import { useUiStore } from "@/stores/ui-store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone, Calendar, ShieldCheck, Ban } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function UserDetailModal() {
    const { modals, closeModal } = useUiStore();
    const { isOpen, data } = modals.userDetail;
    const userData = data?.userData;

    const handleOpenChange = (open: boolean) => {
        if (!open) closeModal("userDetail");
    };

    if (!userData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="px-6 py-5 sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between pr-6">
                        <h2 className="text-lg font-bold">User Profile</h2>
                        {userData.is_deleted ? (
                            <Badge variant="destructive" className="mr-4 flex gap-1">
                                <Ban className="h-3 w-3" /> Deleted
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className={cn({
                                    "mr-2 border-amber-500/30 bg-amber-500/10 text-amber-600": userData.role === "admin",
                                    "mr-2 border-green-500/30 bg-green-500/10 text-green-600": userData.role === "customer",
                                })}
                            >
                                {userData.role === "admin" && <ShieldCheck className="mr-1 h-3 w-3" />}
                                {userData.role === "customer" && <UserCircle className="mr-1 h-3 w-3" />}
                                {userData.role}
                            </Badge>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        User ID: <span className="font-mono text-xs">{userData.user_id}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-2">
                    <div className="flex items-center gap-4">
                        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full border">
                            <UserCircle className="text-muted-foreground h-10 w-10 opacity-20" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-lg leading-none font-bold">{userData.full_name}</span>
                            <span className="text-muted-foreground text-sm font-medium">{userData.email}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <Mail className="text-muted-foreground h-4 w-4" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">Email Address</span>
                                <span className="text-sm font-medium">{userData.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="text-muted-foreground h-4 w-4" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">Phone Number</span>
                                <span className="text-sm font-medium">{userData.phone_number || "No phone provided"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="text-muted-foreground h-4 w-4" />
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs font-semibold uppercase">Joined Platform</span>
                                <span className="text-sm font-medium">{new Date(userData.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
