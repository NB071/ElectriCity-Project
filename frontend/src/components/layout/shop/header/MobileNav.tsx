import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronLeft, ChevronRight, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { useAuthStatus } from "@/hooks/use-me";
import { useLogout } from "@/hooks/api/iam/use-auth";
import { useUiStore } from "@/stores/ui-store";
import { headerNav, type NavItem } from "@/components/layout/data/header-data";

interface MobileNavProps {
    search: string;
    onSearchChange: (v: string) => void;
    onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function MobileNav({ search, onSearchChange, onSearchSubmit }: MobileNavProps) {
    const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
    const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
    const [activeGroup, setActiveGroup] = useState<NavItem | null>(null);

    const { user, status } = useAuthStatus();
    const logout = useLogout();
    const signedIn = status === "authenticated" && user != null;

    return (
        <Sheet
            open={mobileNavOpen}
            onOpenChange={(open) => {
                setMobileNavOpen(open);
                if (!open) setActiveGroup(null);
            }}
        >
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open menu"
                    className={cn("text-white hover:bg-white/10 hover:text-white lg:hidden", "transition-all duration-300")}
                >
                    <Menu className="size-5" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="top"
                showCloseButton={false}
                className="inset-0 h-dvh w-full gap-0 bg-[#0d1226] text-white data-[side=top]:h-dvh data-[side=top]:border-none"
            >
                <SheetTitle className="sr-only">Menu</SheetTitle>

                <div className="flex h-16 shrink-0 items-center justify-between px-4">
                    <Link to="/" onClick={() => setMobileNavOpen(false)} aria-label="ElectriCity home">
                        <img src="/logo192.png" alt="ElectriCity" className="h-8 w-auto" />
                    </Link>
                    <div className="flex items-center gap-1">
                        {signedIn ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Sign out"
                                disabled={logout.isPending}
                                onClick={() => {
                                    logout.mutate({}, { onSettled: () => setMobileNavOpen(false) });
                                }}
                                className="text-white hover:bg-white/10 hover:text-white/90"
                            >
                                <User className="size-5" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Sign in"
                                asChild
                                className="text-white hover:bg-white/10 hover:text-white/90"
                            >
                                <Link to="/auth/login" onClick={() => setMobileNavOpen(false)}>
                                    <User className="size-5" />
                                </Link>
                            </Button>
                        )}
                        <SheetClose asChild>
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/10 hover:text-white/90">
                                <X className="size-5" />
                                Menu
                            </Button>
                        </SheetClose>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-8 pb-6">
                    <form onSubmit={onSearchSubmit} role="search">
                        <InputGroup className="border-white/20 bg-transparent shadow-none dark:bg-transparent">
                            <InputGroupAddon>
                                <Search className="text-white/70" />
                            </InputGroupAddon>
                            <InputGroupInput
                                value={search}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search Cars eg. Audi Q7"
                                aria-label="Search cars"
                                className="text-white placeholder:text-white/55"
                            />
                        </InputGroup>
                    </form>

                    <nav aria-label="Mobile" className="overflow-x-hidden">
                        {activeGroup ? (
                            <div
                                key={activeGroup.label}
                                className={cn("flex flex-col gap-1", "animate-in fade-in-0 slide-in-from-right-full duration-300 ease-out")}
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveGroup(null)}
                                    className="mb-4 flex w-full items-center gap-3 rounded-xl bg-white/10 px-4 py-4 text-base font-medium hover:bg-white/15"
                                >
                                    <ChevronLeft className="size-5 text-white/70" />
                                    Back {activeGroup.label}
                                </button>
                                {activeGroup.children?.map((child) => (
                                    <Link
                                        key={child.to}
                                        to={child.to}
                                        onClick={() => setMobileNavOpen(false)}
                                        className="rounded-md px-4 py-3.5 text-base text-white/90 hover:bg-white/10 hover:text-white"
                                    >
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div
                                key="root"
                                className={cn("flex flex-col gap-1", "animate-in fade-in-0 slide-in-from-right-full duration-300 ease-out")}
                            >
                                {headerNav.map((item) =>
                                    item.children?.length ? (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => setActiveGroup(item)}
                                            className="flex w-full items-center justify-between rounded-md px-4 py-4 text-base font-medium hover:bg-white/10"
                                        >
                                            {item.label}
                                            <ChevronRight className="size-5 text-white/70" />
                                        </button>
                                    ) : (
                                        <Link
                                            key={item.label}
                                            to={item.to ?? "/"}
                                            onClick={() => setMobileNavOpen(false)}
                                            className="flex items-center justify-between rounded-md px-4 py-4 text-base font-medium hover:bg-white/10"
                                        >
                                            {item.label}
                                            <ChevronRight className="size-5 text-white/70" />
                                        </Link>
                                    )
                                )}
                            </div>
                        )}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );
}
