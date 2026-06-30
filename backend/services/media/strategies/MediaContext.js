// Media Service
// Strategy pattern / media context

/**
 * This is the context that wraps the media resolution strategy.
 * @extends MediaStrategy (Strategy pattern)
 */
class MediaContext {
    /** @type {MediaStrategy} */
    #strategy = null;

    /**
     * Sets the media resolution strategy.
     * @param {MediaStrategy} strategy
     */
    setStrategy(strategy) {
        this.#strategy = strategy;
    }

    /**
     * Resolves media for a given catalog item.
     * @param {number} cid
     * @returns {Promise<object[]>}
     * @throws {Error} If the strategy is not set
     */
    resolve(cid) {
        if (!this.#strategy) {
            throw new Error("No media strategy set.");
        }

        return this.#strategy.resolve(cid);
    }

    /**
     * Records a new media asset using the active strategy.
     * @param {object} input
     * @param {string} input.url
     * @param {string} input.file_type
     * @param {string|null} [input.alt_text]
     * @param {number|null} [input.cid]
     * @param {number} [input.display_order]
     * @param {boolean} [input.is_primary]
     * @returns {Promise<{ media_id: number }>}
     * @throws {Error} If the strategy is not set
     */
    record(input) {
        if (!this.#strategy) {
            throw new Error("No media strategy set.");
        }

        return this.#strategy.record(input);
    }
}

export default MediaContext;
