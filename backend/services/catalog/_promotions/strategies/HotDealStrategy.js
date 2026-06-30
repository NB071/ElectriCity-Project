import PromoStrategy from "./PromoStrategy.js";
import { PROMO_NAME_MATCH, PROMO_TYPES } from "../../constants.js";

class HotDealStrategy extends PromoStrategy {
    getNamePattern() {
        return PROMO_NAME_MATCH[PROMO_TYPES.HOT_DEAL];
    }
}

export default new HotDealStrategy();
