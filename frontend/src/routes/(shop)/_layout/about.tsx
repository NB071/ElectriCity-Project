import { WhyUs } from "@/components/shop/WhyUs";
import { About } from "@/components/shop/About";
import { Brands } from "@/components/shop/Brands";
import { TeamSection } from "@/components/shop/TeamSection";
import { TestimonialsSection } from "@/components/shop/Testimonial2";
import { FAQSection } from "@/components/shop/FAQSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(shop)/_layout/about")({
    component: RouteComponent,
});

function AboutHero() {
    return (
        <section className="bg-background mt-12 py-16 md:py-24">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-foreground text-xl font-semibold tracking-tight md:text-2xl">About Us</h2>
                        <h1 className="font-heading text-4xl leading-tight font-bold tracking-tighter text-balance md:text-5xl">
                            We Value Our Clients
                            <br />
                            And Want Them To Have
                            <br />A Nice Experience
                        </h1>
                    </div>
                    <div className="text-muted-foreground flex flex-col justify-center gap-6 text-sm leading-relaxed">
                        <p>
                            At ElectriCity, our mission goes beyond just selling cars. We believe in providing a seamless, educational, and high-end
                            experience that empowers you to transition to a more sustainable future. Our curated selection of premium electric
                            vehicles ensures that no matter your lifestyle, you'll find the perfect, reliable ride.
                        </p>
                        <p>
                            We have revolutionized the traditional car-buying process by creating a transparent, pressure-free environment. From
                            browsing our extensive catalog to securing fair financing options, our dedicated EV specialists are with you every step of
                            the way. We meticulously inspect every vehicle to guarantee exceptional quality and performance.
                        </p>
                        <p>
                            Your satisfaction is our primary focus. We want you to drive off our lot with complete confidence, knowing you made the
                            smartest, most impactful choice.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 pt-4 md:h-100 md:flex-row md:gap-6 lg:h-125">
                    <div className="flex w-full flex-col gap-4 md:w-[20%] md:gap-6">
                        <div className="flex min-h-40 flex-1 flex-col justify-center rounded-2xl bg-blue-600 p-6 text-white md:min-h-0 lg:p-8">
                            <span className="mb-2 text-4xl font-bold lg:text-5xl">45</span>
                            <span className="text-base leading-tight font-medium lg:text-lg">
                                Years in
                                <br />
                                Business
                            </span>
                        </div>
                        <div className="bg-muted relative hidden aspect-square w-full overflow-hidden rounded-2xl md:block">
                            <img src="/about_us_3.jpg" className="absolute inset-0 size-full object-cover" alt="Detail" />
                        </div>
                    </div>
                    <div className="bg-muted relative h-64 w-full overflow-hidden rounded-2xl md:h-full md:w-[40%]">
                        <img src="/about_us_1.jpg" className="absolute inset-0 size-full object-cover" alt="Showroom" />
                    </div>
                    <div className="grid w-full grid-rows-2 gap-4 md:w-[40%] md:gap-6">
                        <div className="bg-muted relative min-h-40 overflow-hidden rounded-2xl md:min-h-0">
                            <img src="/about_us_2.jpg" className="absolute inset-0 size-full object-cover" alt="Customers" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                            <div className="bg-muted relative min-h-40 overflow-hidden rounded-2xl md:min-h-0">
                                <img src="/about_us_3.jpg" className="absolute inset-0 size-full object-cover" alt="Cars" />
                            </div>
                            <div className="bg-muted relative min-h-40 overflow-hidden rounded-2xl md:min-h-0">
                                <img src="/about_us_1.jpg" className="absolute inset-0 size-full object-cover" alt="Showroom Detail" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RouteComponent() {
    return (
        <div className="flex w-full flex-col">
            <AboutHero />

            <WhyUs transparentBG />

            <div className="bg-muted/10 border-y">
                <About />
            </div>

            <Brands />

            <TeamSection />

            <div className="bg-muted/20 border-y">
                <TestimonialsSection />
            </div>

            <div className="bg-background border-b pt-16 md:pt-24">
                <h2 className="text-center text-3xl font-bold tracking-tighter lg:text-4xl">Frequently Asked Questions</h2>
                <FAQSection />
            </div>
        </div>
    );
}
