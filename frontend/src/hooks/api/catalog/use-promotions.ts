// No standalone [GET] /api/shop/catalog/promotions endpoint exists.
// Promotions only come embedded on catalog items and cart lines.
// Needs a real backend route before this can be implemented.

export const useGetPromotions = () => {
    throw new Error("No backend endpoint exists for a standalone promotions list.");
};
