import type { BrowseCatalogFilters } from "@/zod/browse-catalog";
import type { CatalogVehicle, CatalogVehicleDetails } from "@/hooks/api/catalog/use-vehicles";
import type { CatalogListItem } from "@/components/shop/VehicleCard";

export type PromoCategory = NonNullable<CatalogListItem["category"]>;

// this function maps the partial browse catalog filters to the browse catalog filters
export function toBrowseFilters(filters: Partial<BrowseCatalogFilters>): BrowseCatalogFilters {
    const next: BrowseCatalogFilters = {
        sort: filters.sort ?? "added_desc",
    };

    if (filters.brand_id != null && filters.brand_id > 0) next.brand_id = filters.brand_id;
    if (filters.model_id != null && filters.model_id > 0) next.model_id = filters.model_id;
    if (filters.condition) next.condition = filters.condition;
    if (filters.year_min != null) next.year_min = Number(filters.year_min);
    if (filters.year_max != null) next.year_max = Number(filters.year_max);
    if (filters.price_min != null) next.price_min = Number(filters.price_min);
    if (filters.price_max != null) next.price_max = Number(filters.price_max);
    if (filters.mileage_max != null) next.mileage_max = Number(filters.mileage_max);
    if (filters.body_shape && filters.body_shape.length > 0) next.body_shape = filters.body_shape;
    if (filters.drivetrain?.trim()) next.drivetrain = filters.drivetrain.trim();
    if (filters.exterior_color?.trim()) next.exterior_color = filters.exterior_color.trim();
    if (filters.interior_color?.trim()) next.interior_color = filters.interior_color.trim();
    if (filters.promo && filters.promo.length > 0) next.promo = filters.promo;

    return next;
}

// this function infers the promo category from the vehicle promotions
export function inferPromoCategory(vehicle: CatalogVehicle, promoFilter?: PromoCategory | PromoCategory[]): PromoCategory | null {
    if (Array.isArray(promoFilter)) {
        if (promoFilter.length === 1) return promoFilter[0];
    } else if (promoFilter) {
        return promoFilter;
    }

    const names = vehicle.promotions.map((p) => p.name.toLowerCase()).join(" ");
    if (names.includes("hot_deal") || names.includes("hot deal")) return "hot_deal";
    if (names.includes("seasonal")) return "seasonal";
    if (names.includes("clearance")) return "clearance";
    if (names.includes("featured")) return "featured";
    return null;
}

// this function maps the vehicle to the catalog list item
export function toCatalogListItem(vehicle: CatalogVehicle, promoFilter?: PromoCategory | PromoCategory[]): CatalogListItem | null {
    if (!vehicle.vehicle) return null;

    return {
        id: vehicle.id,
        item_type: "vehicle",
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        base_price: vehicle.base_price,
        stock: vehicle.stock,
        is_active: vehicle.is_active,
        primary_image_url: vehicle.primary_image_url,
        image_urls:
            vehicle.image_urls && vehicle.image_urls.length > 0 ? vehicle.image_urls : vehicle.primary_image_url ? [vehicle.primary_image_url] : [],
        promotions: vehicle.promotions,
        vehicle: vehicle.vehicle,
        category: inferPromoCategory(vehicle, promoFilter),
    };
}

// Maps a detail response into the shared card shape used by recently viewed items.
export function vehicleDetailsToCatalogListItem(vehicle: CatalogVehicleDetails): CatalogListItem {
    const imageUrls = vehicle.images.map((image) => image.url);
    const primaryImage = vehicle.images.find((image) => image.is_primary)?.url ?? imageUrls[0] ?? null;
    const promoNames = vehicle.promotions.map((promotion) => promotion.name.toLowerCase()).join(" ");
    const category: PromoCategory | null = promoNames.includes("hot_deal") || promoNames.includes("hot deal")
        ? "hot_deal"
        : promoNames.includes("seasonal")
          ? "seasonal"
          : promoNames.includes("clearance")
            ? "clearance"
            : promoNames.includes("featured")
              ? "featured"
              : null;

    return {
        id: vehicle.id,
        item_type: "vehicle",
        name: vehicle.name,
        brand: { id: vehicle.brand.id, name: vehicle.brand.name },
        model: { id: vehicle.model.id, name: vehicle.model.name },
        base_price: vehicle.base_price,
        stock: vehicle.stock,
        is_active: vehicle.is_active,
        primary_image_url: primaryImage,
        image_urls: imageUrls,
        promotions: vehicle.promotions,
        vehicle: {
            year: vehicle.vehicle.year ?? vehicle.model.release_year ?? 0,
            condition: vehicle.vehicle.condition,
            mileage: vehicle.vehicle.mileage ?? 0,
            exterior_color: vehicle.vehicle.exterior_color ?? "Not specified",
            interior_color: vehicle.vehicle.interior_color ?? "Not specified",
            body_shape: vehicle.vehicle.body_shape ?? "Not specified",
            door_count: vehicle.vehicle.door_count ?? 0,
            drivetrain: vehicle.vehicle.drivetrain ?? "Not specified",
        },
        category,
    };
}
