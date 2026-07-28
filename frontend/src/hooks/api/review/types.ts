export type ReviewCore = {
    review_id: number;
    title: string | null;
    body: string | null;
    rating: number;
    created_at: string;
};

export type ReviewAuthor = {
    user_id: number;
    first_name: string;
    last_name: string;
};

export type ReviewUser = ReviewAuthor & {
    email: string;
    is_deleted?: boolean;
};

export type ReviewCatalogItem = {
    cid: number;
    item_type: string;
    name: string;
    primary_image_url: string | null;
};

export type CatalogReviewDTO = ReviewCore & { author: ReviewAuthor };

export type CustomerReviewDTO = ReviewCore & { catalog_item: ReviewCatalogItem };

export type AdminReviewListDTO = ReviewCore & {
    user: ReviewUser;
    catalog_item: ReviewCatalogItem;
};

export type ReviewDetailDTO = AdminReviewListDTO;

export type PublishReviewResponse = ReviewCore & { cid: number };

export const reviewKeys = {
    all: ["reviews"] as const,
    vehicle: (cid: string | number) => [...reviewKeys.all, "vehicle", String(cid)] as const,
    customer: () => [...reviewKeys.all, "customer"] as const,
    admin: () => [...reviewKeys.all, "admin"] as const,
    adminDetail: (rid: string | number) => [...reviewKeys.all, "admin", String(rid)] as const,
};
