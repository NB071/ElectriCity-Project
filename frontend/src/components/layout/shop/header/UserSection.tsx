import { Link, useNavigate } from "@tanstack/react-router";
import { User, LayoutDashboard, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStatus } from "@/hooks/use-me";
import { useLogout } from "@/hooks/api/iam/use-auth";
import { dashboardHomeFor } from "@/lib/auth";

export function UserSection() {
    const { user, status } = useAuthStatus();
    const navigate = useNavigate();
    const logout = useLogout();

    const signedIn = status === "authenticated" && user != null;

    if (status === "unknown") {
        return <div className="hidden h-10 w-40 animate-pulse rounded-md bg-white/10 lg:block" aria-hidden />;
    }

    const handleLogout = () => {
        logout.mutate(
            {},
            {
                onSettled: () => navigate({ to: "/" }),
            }
        );
    };

    if (signedIn) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-10 gap-2 px-2 text-white duration-300 hover:bg-white/10 aria-expanded:bg-white/10",
                            "transition-all duration-300"
                        )}
                    >
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-900">
                            {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="hidden flex-col items-start gap-0.5 text-left leading-none sm:flex">
                            <span className="text-sm font-semibold">
                                {user?.first_name || "User"} {user?.last_name || ""}
                            </span>
                            <span className="text-[10px] font-medium text-white/70 capitalize">{user?.role || "Customer"}</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2 w-56" sideOffset={8}>
                    <div className="flex items-center justify-start gap-3 p-2">
                        <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-900">
                            {(user?.first_name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                            <div className="border-background absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 bg-[#00b67a]" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <p className="truncate text-sm leading-none font-semibold">
                                {user?.first_name || "User"} {user?.last_name || ""}
                            </p>
                            <p className="text-muted-foreground truncate text-xs leading-none">{user?.email}</p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/dashboard/settings/profile">
                                <User className="mr-2 size-4" />
                                <span>My account</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to={dashboardHomeFor(user)}>
                                <LayoutDashboard className="mr-2 size-4" />
                                <span>Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending} className="cursor-pointer text-red-500 focus:text-red-500">
                        <span className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2 size-4"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            {logout.isPending ? "Logging out…" : "Logout"}
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <ButtonGroup className="hidden lg:flex">
            <Button variant="ghost" asChild className="border-white/10 text-white transition-all duration-300">
                <Link to="/auth/login">
                    <User className="mr-2 size-4" />
                    <span>Sign in</span>
                </Link>
            </Button>
            <Button variant="default" asChild className="border-white/10 text-white transition-all duration-300">
                <Link to="/auth/register">
                    <UserPlus className="mr-2 size-4" />
                    <span>Sign up</span>
                </Link>
            </Button>
        </ButtonGroup>
    );
}
