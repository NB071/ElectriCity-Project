import { useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { CartSection, SAMPLE_CART } from "./CartSection";
import { UserSection } from "./UserSection";

function Header() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const scrolled = useScroll(10);

    const location = useLocation();
    const isLanding = location.pathname === "/";

    function onSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const q = search.trim();
        if (!q) return;
        void navigate({ to: "/catalog" });
    }

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 text-white transition-all duration-300",
                scrolled || !isLanding ? "border-b border-white/10 bg-[#0d1226]/90 shadow-sm backdrop-blur-md" : "border-transparent bg-transparent"
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-12 px-4 sm:px-6 lg:px-8">
                <Link to="/" className="shrink-0" aria-label="ElectriCity home">
                    <img src="/logo192.png" alt="ElectriCity" className="h-8 w-auto md:hidden" />
                    <img src="/header_logo.svg" alt="ElectriCity" className="hidden h-auto w-28 rounded-md bg-white p-1 md:block" />
                </Link>

                <form onSubmit={onSearchSubmit} className="hidden min-w-0 flex-1 md:block lg:max-w-xs" role="search">
                    <InputGroup className={cn("border-white/10 bg-transparent shadow-none dark:bg-transparent", "transition-all duration-300")}>
                        <InputGroupAddon>
                            <Search className="text-white/70" />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search Cars eg. Audi Q7"
                            aria-label="Search cars"
                            className="text-white placeholder:text-white/55"
                        />
                    </InputGroup>
                </form>

                <div className="ml-auto flex flex-wrap items-center justify-end gap-2 lg:gap-6">
                    <DesktopNav />

                    <div className="flex items-center gap-4">
                        <CartSection count={SAMPLE_CART.count} items={SAMPLE_CART.items} />
                        <UserSection />

                        <MobileNav search={search} onSearchChange={setSearch} onSearchSubmit={onSearchSubmit} />
                    </div>
                </div>
            </div>
        </header>
    );
}

export { Header };
