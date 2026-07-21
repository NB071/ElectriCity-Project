import { Star, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

const REVIEWS = [
    {
        id: 1,
        title: "Sales process was simple and easy",
        body: "Sales process was simple and easy. Maximillion was friendly and I didn't feel pressured at all.",
        author: "Ali Tufan",
        time: "2 hours ago",
    },
    {
        id: 2,
        title: "Sales process was simple and easy",
        body: "Sales process was simple and easy. Maximillion was friendly and I didn't feel pressured at all.",
        author: "Ali Tufan",
        time: "2 hours ago",
    },
    {
        id: 3,
        title: "Sales process was simple and easy",
        body: "Sales process was simple and easy. Maximillion was friendly and I didn't feel pressured at all.",
        author: "Ali Tufan",
        time: "2 hours ago",
    },
    {
        id: 4,
        title: "Sales process was simple and easy",
        body: "Sales process was simple and easy. Maximillion was friendly and I didn't feel pressured at all.",
        author: "Ali Tufan",
        time: "2 hours ago",
    },
    {
        id: 5,
        title: "Sales process was simple and easy",
        body: "Sales process was simple and easy. Maximillion was friendly and I didn't feel pressured at all.",
        author: "Ali Tufan",
        time: "2 hours ago",
    },
];

export function Testimonial1() {
    return (
        <section className="overflow-hidden bg-slate-50/50 py-16 md:py-24">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-12">
                <div className="flex flex-col gap-4">
                    <Badge variant="outline" className="text-primary h-7 w-fit rounded-full bg-white px-3 text-xs font-medium shadow-sm">
                        Testimonials
                    </Badge>
                    <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">What our customers say</h2>
                </div>

                <div className="relative w-full">
                    <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 md:-ml-6">
                            {REVIEWS.map((review) => (
                                <CarouselItem key={review.id} className="p-5 md:basis-1/2 md:pl-6 lg:basis-1/3 xl:basis-1/4">
                                    <Card className="h-full border-none shadow-sm shadow-slate-200/50 transition-shadow hover:shadow-md">
                                        <CardContent className="flex h-full flex-col gap-4 p-6">
                                            {/* Header */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-0.5 text-[#00b67a]">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className="size-4 fill-current" />
                                                    ))}
                                                </div>
                                                <div className="flex flex-1 items-center gap-1.5 text-xs font-medium text-slate-600">
                                                    <CheckCircle className="size-4 fill-slate-700 text-white" />
                                                    Verified
                                                </div>
                                            </div>

                                            {/* Body */}
                                            <div className="flex flex-1 flex-col gap-2">
                                                <h3 className="leading-snug font-semibold text-slate-900">{review.title}</h3>
                                                <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{review.body}</p>
                                            </div>

                                            {/* Footer */}
                                            <div className="mt-2 text-xs font-medium text-slate-500">
                                                <span className="font-semibold text-slate-900">{review.author}</span>, {review.time}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <div className="hidden md:block">
                            <CarouselPrevious className="-left-14 size-10 border-slate-200 bg-white shadow-sm hover:bg-slate-50" />
                            <CarouselNext className="-right-14 size-10 border-slate-200 bg-white shadow-sm hover:bg-slate-50" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
