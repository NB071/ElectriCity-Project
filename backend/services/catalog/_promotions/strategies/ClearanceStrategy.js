import PromoStrategy from "./PromoStrategy.js";
import { PROMO_NAME_MATCH, PROMO_TYPES } from "../../constants.js";

class ClearanceStrategy extends PromoStrategy {
    getNamePattern() {
        return PROMO_NAME_MATCH[PROMO_TYPES.CLEARANCE];
    }
}

export default new ClearanceStrategy();
