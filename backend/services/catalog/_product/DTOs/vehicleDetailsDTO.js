import { toReviewSummaryDTO } from "../../../review/DTOs/reviewSummaryDTO.js";

/**
 * This function maps the vehicle details to a representable format.
 * @param {object} base Base catalog item details
 * @param {object} subtype Vehicle subtype details
 * @param {object[]} customizations Customization options
 * @param {object|null} history Vehicle history details
 * @param {object[]} images Images of the vehicle
 * @param {object|null} historyReport Resolved media record for vehicle history report
 * @param {object[]} [promotions]
 * @param {{ review_count: number, avg_rating: number|null }} [reviewSummary]
 * @returns {object}
 */
function toVehicleDetailsDTO(
    base,
    subtype,
    customizations,
    history,
    images = [],
    historyReport = null,
    promotions = [],
    reviewSummary = { review_count: 0, avg_rating: null },
) {
    return {
        id: base.cid,
        item_type: base.item_type,
        name: `${base.brand_name} ${base.model_name}`,
        description: base.model_description,
        base_price: Number(base.base_price),
        stock: base.quantity,
        is_active: Boolean(base.is_active),
        ...toReviewSummaryDTO(reviewSummary),
        brand: {
            id: base.brand_id,
            name: base.brand_name,
            country: base.brand_country,
        },
        model: {
            id: base.model_id,
            name: base.model_name,
            release_year: base.release_year,
        },
        vehicle: {
            year: subtype.year,
            condition: subtype.condition,
            mileage: subtype.mileage,
            body_shape: subtype.body_shape,
            door_count: subtype.door_count,
            drivetrain: subtype.drivetrain,
        },
        customizations,
        promotions,
        history: history
            ? {
                  has_accidents: Boolean(history.has_accidents),
                  report: historyReport
                      ? {
                            media_id: historyReport.media_id,
                            url: historyReport.url,
                            alt_text: historyReport.alt_text ?? null,
                        }
                      : null,
              }
            : null,
        images: images.map((image) => ({
            media_id: image.media_id,
            url: image.url,
            alt_text: image.alt_text ?? null,
            display_order: image.display_order ?? 0,
            is_primary: Boolean(image.is_primary),
        })),
    };
}

export { toVehicleDetailsDTO };
