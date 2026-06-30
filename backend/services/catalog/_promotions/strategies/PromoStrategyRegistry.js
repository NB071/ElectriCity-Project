import { ValidationError } from "../../../../utils/errors.js";
import { PROMO_TYPES } from "../../constants.js";
import promotionsDAO from "../promotionsDAO.js";
import { validatePromoType } from "../promotionValidator.js";
import hotDealStrategy from "./HotDealStrategy.js";
import seasonalStrategy from "./SeasonalStrategy.js";
import clearanceStrategy from "./ClearanceStrategy.js";
import featuredStrategy from "./FeaturedStrategy.js";

const strategies = {
    [PROMO_TYPES.HOT_DEAL]: hotDealStrategy,
    [PROMO_TYPES.SEASONAL]: seasonalStrategy,
    [PROMO_TYPES.CLEARANCE]: clearanceStrategy,
    [PROMO_TYPES.FEATURED]: featuredStrategy,
};

/**
 * Resolves a promo type to a browse-filter SQL fragment via its strategy + DAO.
 * @param {string} promoType
 * @returns {{ sql: string, params: unknown[] }}
 * @throws {ValidationError} If the promo type is not valid
 */
function getPromoFragment(promoType) {
    const validType = validatePromoType(promoType);
    const strategy = strategies[validType];

    if (!strategy) {
        throw new ValidationError(
            `No strategy registered for promo type "${validType}".`,
        );
    }

    return promotionsDAO.buildBrowseFilterFragment(strategy.getNamePattern());
}

export default { getPromoFragment };
