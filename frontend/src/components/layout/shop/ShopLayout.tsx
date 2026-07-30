import { Footer } from "./Footer";
import { Header } from "./header/Header";
import { Outlet } from "@tanstack/react-router";
import { CompareItemsFAB } from "./CompareItemsFAB";

function ShopLayout() {
    return (
        <div className="relative flex min-h-svh flex-col text-zinc-950">
            <div className="relative z-10 flex flex-1 flex-col rounded-b-[2rem] bg-slate-50 sm:rounded-b-[3.5rem]">
                <Header />
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
            <Footer />
            <CompareItemsFAB />
        </div>
    );
}

export default ShopLayout;
