import PromoStrategy from "./PromoStrategy.js";
import { PROMO_NAME_MATCH, PROMO_TYPES } from "../../constants.js";

class FeaturedStrategy extends PromoStrategy {
    getNamePattern() {
        return PROMO_NAME_MATCH[PROMO_TYPES.FEATURED];
    }
}

export default new FeaturedStrategy();
