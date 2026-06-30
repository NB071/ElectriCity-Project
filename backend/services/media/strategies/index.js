// Media Service
// Strategy registry & context

import imageStrategy from "./ImageStrategy.js";
import pdfStrategy from "./PdfStrategy.js";
import MediaContext from "./MediaContext.js";
import { VALIDATIONS } from "../constants.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * Registry of available media strategies, key'ed by media type.
 */
const strategies = {
    [VALIDATIONS.MEDIA_TYPES.IMAGE]: imageStrategy,
    [VALIDATIONS.MEDIA_TYPES.PDF]: pdfStrategy,
};

/**
 * This looks up a media strategy by type and returns it wrapped in a context.
 * @param {string} type - Media type from VALIDATIONS.MEDIA_TYPES constants
 * @returns {MediaContext} (Strategy pattern)
 * @throws {Error} If no strategy is registered under the given type
 */
function getStrategy(type) {
    const strategy = strategies[type];

    if (!strategy) {
        throw new Error(
            `Unknown media type "${type}". Registered: ${Object.keys(strategies).join(", ")}`,
        );
    }

    const context = new MediaContext();
    context.setStrategy(strategy);
    return context;
}

/**
 * This looks up a media strategy context from a MIME file_type.
 * @param {string} file_type
 * @returns {MediaContext}
 * @throws {Error} If file_type is not supported by any registered strategy
 */
function getStrategyForFileType(file_type) {
    if (VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE.includes(file_type)) {
        return getStrategy(VALIDATIONS.MEDIA_TYPES.IMAGE);
    }

    if (VALIDATIONS.ALLOWED_FILE_TYPES.PDF.includes(file_type)) {
        return getStrategy(VALIDATIONS.MEDIA_TYPES.PDF);
    }

    throw new ValidationError(
        `Unsupported file type "${file_type}". Allowed: ${[
            ...VALIDATIONS.ALLOWED_FILE_TYPES.IMAGE,
            ...VALIDATIONS.ALLOWED_FILE_TYPES.PDF,
        ].join(", ")}`,
    );
}

export default getStrategy;
export { getStrategyForFileType };
