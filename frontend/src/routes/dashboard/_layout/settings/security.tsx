import { createFileRoute } from "@tanstack/react-router";
import { Laptop, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContentSection } from "@/components/dashboard/ContentSection";
import { useUiStore } from "@/stores/ui-store";

export const Route = createFileRoute("/dashboard/_layout/settings/security")({
    component: RouteComponent,
});

function ChangePasswordForm() {
    const { openModal } = useUiStore();

    return (
        <form
            className="space-y-6"
            onSubmit={(e) => {
                e.preventDefault();
                openModal("passwordSuccess");
            }}
        >
            <div className="grid gap-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" placeholder="Enter your current password" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" placeholder="Enter your new password" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input id="confirm_password" type="password" placeholder="Confirm your new password" />
            </div>
            <Button type="submit">Update password</Button>
        </form>
    );
}

function SessionManagement() {
    const { openModal } = useUiStore();

    // Note: session implementation mocked temporarily
    const mockSessions = [
        { id: "sess-1", deviceLabel: "Windows • Chrome Browser", ipAddress: "192.168.1.10", lastSeenAt: new Date().toISOString(), isCurrent: true },
        {
            id: "sess-2",
            deviceLabel: "iPhone 13 • Safari",
            ipAddress: "172.24.18.9",
            lastSeenAt: new Date(Date.now() - 86400000).toISOString(),
            isCurrent: false,
        },
    ];

    return (
        <div className="space-y-6">
            {mockSessions.map((session) => (
                <div key={session.id} className="border-border bg-card flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                        {session.deviceLabel?.includes("iPhone") ? (
                            <Smartphone className="text-muted-foreground h-6 w-6" />
                        ) : (
                            <Laptop className="text-muted-foreground h-6 w-6" />
                        )}
                        <div>
                            <p className="text-sm font-medium">
                                {session.deviceLabel || "Unknown Device"}
                                {session.isCurrent && <span className="text-primary ml-2 text-xs font-bold">(Current Device)</span>}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                IP: {session.ipAddress} • Last active: {new Date(session.lastSeenAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    {!session.isCurrent && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openModal("sessionRevoke", { sessionId: session.id, label: session.deviceLabel })}
                        >
                            Revoke
                        </Button>
                    )}
                </div>
            ))}
            <div className="border-t pt-4">
                <Button variant="destructive" className="w-full sm:w-auto" onClick={() => openModal("sessionRevokeAll")}>
                    Sign out of all other devices
                </Button>
            </div>
        </div>
    );
}

function RouteComponent() {
    return (
        <ContentSection title="Security" desc="Manage your password and active sessions">
            <div className="space-y-12">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-foreground text-lg font-medium">Change Password</h3>
                        <p className="text-muted-foreground text-[0.8rem] font-normal">Update your password to keep your account secure.</p>
                    </div>
                    <ChangePasswordForm />
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-foreground text-lg font-medium">Active Sessions</h3>
                        <p className="text-muted-foreground text-[0.8rem] font-normal">
                            Manage the devices and locations where you are currently signed in.
                        </p>
                    </div>
                    <SessionManagement />
                </div>
            </div>
        </ContentSection>
    );
}
