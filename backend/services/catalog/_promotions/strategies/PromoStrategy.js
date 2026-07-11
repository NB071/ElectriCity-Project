// Catalog Promotions
// Strategy pattern / promo strategy abstract class

import { InternalError } from "../../../../utils/errors.js";

/**
 * @abstract
 */
class PromoStrategy {
    /**
     * @returns {string} Promo name LIKE pattern for browse filtering
     * @throws {InternalError} If the getNamePattern method is not implemented by the subclass
     */
    getNamePattern() {
        throw new InternalError(
            "getNamePattern() must be implemented by subclass",
        );
    }
}

export default PromoStrategy;
