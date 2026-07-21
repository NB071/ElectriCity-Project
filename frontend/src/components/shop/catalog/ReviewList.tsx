import { Star, User } from "lucide-react";

type ReviewResponseDTO = {
    review_id: number;
    title: string | null;
    body: string | null;
    rating: number;
    created_at: string;
    customer: {
        first_name: string;
        last_name: string;
    };
};

const MOCK_ITEM_REVIEWS: ReviewResponseDTO[] = [
    {
        review_id: 1,
        title: "Good Cars",
        body: "The vehicle exceeds all my expectations. The acceleration is incredibly smooth, and the autopilot features have practically driven me through all cross-state trips. Highly recommend grabbing the extended battery pack.",
        rating: 5,
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        customer: {
            first_name: "Ali",
            last_name: "Tufan",
        },
    },
    {
        review_id: 2,
        title: "Solid Performance",
        body: "The vehicle exceeds all my expectations. The acceleration is incredibly smooth, and the autopilot features have practically driven me through all cross-state trips. Highly recommend grabbing the extended battery pack.",
        rating: 4,
        created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
        customer: {
            first_name: "Sarah",
            last_name: "Jenkins",
        },
    },
];

export function ReviewList({ cid }: { cid: number }) {
    const reviews = MOCK_ITEM_REVIEWS;

    if (!reviews || reviews.length === 0) {
        return (
            <div className="bg-muted/20 mt-8 rounded-xl border px-6 py-8 text-center">
                <p className="text-muted-foreground font-semibold">No community reviews have been recorded for this item yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="mt-12 flex flex-col gap-10">
            {reviews.map((review) => {
                const dateOptions: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
                const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", dateOptions);

                return (
                    <div key={review.review_id} className="flex gap-4 sm:gap-6">
                        {/* Avatar */}
                        <div className="bg-muted/50 border-border flex size-12 shrink-0 items-center justify-center rounded-full border sm:size-16">
                            <User className="text-muted-foreground size-6 opacity-50 sm:size-8" />
                        </div>

                        {/* Content */}
                        <div className="flex w-full flex-col">
                            <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                <h5 className="text-base font-bold sm:text-lg">
                                    {review.customer?.first_name} {review.customer?.last_name}
                                </h5>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`size-3 sm:size-4 ${
                                                i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-muted-foreground mb-4 text-xs font-medium">{formattedDate}</span>
                            {review.title && <h6 className="mb-2 text-sm font-bold">{review.title}</h6>}
                            <p className="text-muted-foreground text-sm leading-relaxed">{review.body}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
