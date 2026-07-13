// Cart Service (Helpers)

import configurationsDAO from "../../catalog/_configurations/configurationsDAO.js";
import { ValidationError } from "../../../utils/errors.js";

/**
 * This function ensures the configuration belongs to the given catalog item (when provided).
 * It matches the order resolveItemPricing ownership check.
 * @helper_function
 * @param {number} cid catalog item id
 * @param {number|null|undefined} configId configuration id
 * @returns {Promise<void>}
 * @throws {NotFoundError} If the configuration does not exist
 * @throws {ValidationError} If the configuration does not belong to cid
 * @throws {DatabaseError} On database failures
 */
async function assertConfigBelongsToCatalog(cid, configId) {
    if (configId == null) {
        return;
    }

    // find the configuration
    const configuration = await configurationsDAO.findById(configId);

    // if the configuration does not belong to the catalog item, throw an error
    if (Number(configuration.cid) !== Number(cid)) {
        throw new ValidationError(
            `config_id ${configId} does not belong to cid ${cid}.`,
        );
    }
}

export { assertConfigBelongsToCatalog };
