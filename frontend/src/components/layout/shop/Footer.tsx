import { Link } from "@tanstack/react-router";
import { MessageSquare, Scale, Globe, Share2, Camera, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { footerLinks } from "@/components/layout/data/header-data";
import { useGetBrandsLite } from "@/hooks/api/catalog/use-brands";

export function Footer() {
    const [height, setHeight] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const { data: brandsData } = useGetBrandsLite();
    const brands = brandsData?.items ?? [];

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setHeight(entry.contentRect.height);
            }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            {/* The transparent spacer to allow scrolling */}
            <div style={{ height }} aria-hidden className="pointer-events-none w-full shrink-0" />

            {/* The fixed footer sitting underneath */}
            <div ref={ref} className="fixed bottom-0 left-0 z-0 w-full bg-[#0b1121]">
                <footer className="pt-16 text-white sm:pt-20 lg:pt-24">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Top Section */}
                        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-12 md:flex-row md:items-start lg:pb-16">
                            <div className="flex flex-col gap-2 text-center md:text-left">
                                <h2 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">Join ElectriCity</h2>
                                <p className="text-sm text-white/70">Receive pricing updates, shopping tips & more!</p>
                            </div>
                            <form className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/5 p-1.5 ring-1 ring-white/10 transition-colors focus-within:ring-white/30">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
                                    required
                                />
                                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
                                    Sign Up
                                </Button>
                            </form>
                        </div>

                        {/* Middle Links Section */}
                        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5 lg:py-16 xl:grid-cols-6">
                            <div className="flex flex-col gap-4">
                                <h3 className="font-semibold text-white">Company</h3>
                                <ul className="flex flex-col gap-3 text-sm text-white/60">
                                    {footerLinks.company.map((link) => (
                                        <li key={link.label}>
                                            <Link to={link.to} className="transition-colors hover:text-white">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="font-semibold text-white">Quick Links</h3>
                                <ul className="flex flex-col gap-3 text-sm text-white/60">
                                    {footerLinks.quickLinks.map((link) => (
                                        <li key={link.label}>
                                            <Link to={link.to} className="transition-colors hover:text-white">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="font-semibold text-white">Our Brands</h3>
                                <ul className="flex flex-col gap-3 text-sm text-white/60">
                                    {brands.map((brand) => (
                                        <li key={brand.id}>
                                            <Link
                                                to="/catalog"
                                                search={{ brand_id: brand.id } as never}
                                                className="transition-colors hover:text-white"
                                            >
                                                {brand.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex flex-col gap-4">
                                <h3 className="font-semibold text-white">Vehicles Type</h3>
                                <ul className="flex flex-col gap-3 text-sm text-white/60">
                                    {footerLinks.vehicleTypes.map((link) => (
                                        <li key={link.label}>
                                            <Link to={link.to} className="transition-colors hover:text-white">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="col-span-2 flex flex-col gap-8 md:col-span-4 lg:col-span-2">
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold text-white">Smart Tools</h3>
                                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 justify-start gap-3 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link to="/chatbot">
                                                <MessageSquare className="size-5" />
                                                <div className="flex flex-col items-start gap-0.5 leading-none">
                                                    <span className="text-[10px] font-medium text-white/60 uppercase">AI Assistant</span>
                                                    <span className="text-sm font-semibold">Try Chatbot</span>
                                                </div>
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 justify-start gap-3 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                                        >
                                            <Link to="/catalog/compare">
                                                <Scale className="size-5" />
                                                <div className="flex flex-col items-start gap-0.5 leading-none">
                                                    <span className="text-[10px] font-medium text-white/60 uppercase">Head to Head</span>
                                                    <span className="text-sm font-semibold">Compare Cars</span>
                                                </div>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <h3 className="font-semibold text-white">Connect With Us</h3>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                                        >
                                            <Globe className="size-4" />
                                            <span className="sr-only">Website</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                                        >
                                            <Share2 className="size-4" />
                                            <span className="sr-only">Social</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                                        >
                                            <Camera className="size-4" />
                                            <span className="sr-only">Instagram</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-full bg-white/5 text-white/70 hover:bg-white/15 hover:text-white"
                                        >
                                            <Mail className="size-4" />
                                            <span className="sr-only">Contact</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Copyright Section */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm text-white/60 md:flex-row">
                            <p>© {new Date().getFullYear()} ElectriCity. All rights reserved.</p>
                            <div className="flex items-center gap-4">
                                <Link to="/terms" className="transition-colors hover:text-white">
                                    Terms & Conditions
                                </Link>
                                <span>•</span>
                                <Link to="/privacy" className="transition-colors hover:text-white">
                                    Privacy Notice
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
