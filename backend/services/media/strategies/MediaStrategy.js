// Media Service
// Strategy pattern / media strategy abstract class

/**
 * This is the abstract class for media resolution strategies.
 * @abstract
 */
class MediaStrategy {
    /**
     * This method must be implemented by each media strategy.
     * @param {number} _cid
     * @returns {Promise<object[]>}
     * @throws {Error} If the resolve method is not implemented by the subclass
     */
    resolve(_cid) {
        throw new Error("resolve() must be implemented by subclass");
    }

    /**
     * This method must be implemented by each media strategy.
     * @param {object} _input
     * @returns {Promise<{ media_id: number }>}
     * @throws {Error} If the record method is not implemented by the subclass
     */
    record(_input) {
        throw new Error("record() must be implemented by subclass");
    }
}

export default MediaStrategy;
