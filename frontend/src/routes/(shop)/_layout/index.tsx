import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/shop/About";
import { Brands } from "@/components/shop/Brands";
import { Hero } from "@/components/shop/home/Hero";
import { Vehicles } from "@/components/shop/home/Vehicles";
import { WhyUs } from "@/components/shop/WhyUs";
import { LoanCalculator } from "@/components/shop/LoanCalculator";
import { Testimonial1 } from "@/components/shop/home/Testimonial1";
import { ChatbotPromo } from "@/components/shop/home/ChatbotPromo";

export const Route = createFileRoute("/(shop)/_layout/")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <main className="relative">
            <Hero />
            <div className="bg-background relative z-10 flex flex-col shadow-[0_-20px_25px_-5px_rgb(0_0_0/0.1)]">
                <Brands />
                <Vehicles />
                <WhyUs />
                <LoanCalculator />
                <ChatbotPromo />
                <Testimonial1 />
                <About />
            </div>
        </main>
    );
}
