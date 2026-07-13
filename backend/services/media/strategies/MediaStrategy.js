// Media Service
// Strategy pattern / media strategy abstract class

import { InternalError } from "../../../utils/errors.js";

/**
 * This is the abstract class for media resolution strategies.
 * @abstract
 */
class MediaStrategy {
    /**
     * This method must be implemented by each media strategy.
     * @param {number} _cid
     * @returns {Promise<object[]>}
     * @throws {InternalError} If the resolve method is not implemented by the subclass
     */
    resolve(_cid) {
        throw new InternalError("resolve() must be implemented by subclass");
    }

    /**
     * This method must be implemented by each media strategy.
     * @param {object} _input
     * @returns {Promise<{ media_id: number }>}
     * @throws {InternalError} If the record method is not implemented by the subclass
     */
    record(_input) {
        throw new InternalError("record() must be implemented by subclass");
    }
}

export default MediaStrategy;
