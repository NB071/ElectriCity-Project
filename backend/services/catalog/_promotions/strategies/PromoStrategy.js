// Catalog Promotions
// Strategy pattern / promo strategy abstract class

/**
 * @abstract
 */
class PromoStrategy {
    /**
     * @returns {string} Promo name LIKE pattern for browse filtering
     */
    getNamePattern() {
        throw new Error("getNamePattern() must be implemented by subclass");
    }
}

export default PromoStrategy;
