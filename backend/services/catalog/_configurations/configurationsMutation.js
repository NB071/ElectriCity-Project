import configurationsDAO from "./configurationsDAO.js";
import optionsDAO from "../_options/optionsDAO.js";
import productDAO from "../_product/productDAO.js";
import { validateCreateConfiguration } from "./configurationsValidator.js";
import { NotFoundError, ValidationError } from "../../../utils/errors.js";
import { toConfigurationDTO } from "./DTOs/configurationDTO.js";
import { groupOptionsByCategory } from "../_options/optionsQuery.js";

/**
 * This function creates a new configuration.
 * @param {object} data
 * @param {number} data.cid
 * @param {number[]} data.option_ids
 * @returns {Promise<object>}
 * @throws {NotFoundError} If the catalog item does not exist
 * @throws {ValidationError} If the option_ids are not valid
 * @throws {DatabaseError} On database failures
 */
async function createConfiguration({ cid, option_ids }) {
    const valid = validateCreateConfiguration({ cid, option_ids });

    const base = await productDAO.findBaseById(valid.cid);
    if (!base) {
        throw new NotFoundError("Catalog item");
    }

    const allowed = await optionsDAO.findCatalogOptionsForItem(
        valid.cid,
        valid.option_ids,
    );

    if (allowed.length !== valid.option_ids.length) {
        throw new ValidationError(
            "One or more option_ids are not available for this catalog item.",
        );
    }

    const optionRows = await optionsDAO.findOptionsByIds(valid.option_ids);

    if (optionRows.length !== valid.option_ids.length) {
        throw new ValidationError(
            "One or more option_ids could not be resolved.",
        );
    }

    const deltaTotal = optionRows.reduce(
        (sum, row) => sum + Number(row.price_delta),
        0,
    );
    const totalPrice = Number(base.base_price) + deltaTotal;

    const configId = await configurationsDAO.insertConfiguration({
        cid: valid.cid,
        total_price: totalPrice,
        option_ids: valid.option_ids,
    });

    const configuration = await configurationsDAO.findById(configId);
    const selectedRows =
        await configurationsDAO.findOptionsByConfigId(configId);

    return toConfigurationDTO(
        configuration,
        groupOptionsByCategory(selectedRows),
    );
}

export { createConfiguration };
