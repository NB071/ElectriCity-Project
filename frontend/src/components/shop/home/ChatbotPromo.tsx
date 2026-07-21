import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatbotPromo() {
    return (
        <section
            className="relative flex h-150 w-full items-center overflow-hidden bg-cover bg-fixed bg-center text-white"
            style={{ backgroundImage: "url('/chatbot_landing_bg.jpg')" }}
        >
            {/* Background overlay */}
            <div aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-blue-900/70" />

            <div className="relative z-10 mx-auto flex w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex max-w-2xl flex-col items-start gap-8">
                    <div className="flex flex-col gap-5">
                        <div className="flex w-fit items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1 shadow-sm backdrop-blur-md">
                            <span className="text-xs font-semibold tracking-wide text-white uppercase">AI Assistant</span>
                        </div>
                        <h2 className="font-heading text-4xl leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-5xl">
                            We Make Finding The
                            <br />
                            Right Car Simple
                        </h2>
                        <p className="max-w-lg text-base leading-relaxed font-medium text-white/90">
                            Not sure which electric vehicle is right for you? Our advanced AI chatbot analyzes your lifestyle, budget, and driving
                            habits to give you perfectly personalized car recommendations in seconds.
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="h-12 rounded-xl border-white/40 bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                    >
                        <Link to="/chatbot">
                            Find Out More <ArrowUpRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
