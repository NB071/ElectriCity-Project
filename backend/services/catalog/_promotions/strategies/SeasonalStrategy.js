import PromoStrategy from "./PromoStrategy.js";
import { PROMO_NAME_MATCH, PROMO_TYPES } from "../../constants.js";

class SeasonalStrategy extends PromoStrategy {
    getNamePattern() {
        return PROMO_NAME_MATCH[PROMO_TYPES.SEASONAL];
    }
}

export default new SeasonalStrategy();
