import configurationsDAO from "./configurationsDAO.js";
import { validateConfigId } from "./configurationsValidator.js";
import { groupOptionsByCategory } from "../_options/optionsQuery.js";
import { toConfigurationDTO } from "./DTOs/configurationDTO.js";

/**
 * This function gets a configuration by its ID.
 * @param {number} configId
 * @returns {Promise<object>}
 * @throws {ValidationError} If the configuration ID is invalid
 * @throws {NotFoundError} If the configuration does not exist
 * @throws {DatabaseError} On database failures
 */
async function getConfigurationById(configId) {
    const id = validateConfigId(configId);
    const configuration = await configurationsDAO.findById(id);
    const optionRows = await configurationsDAO.findOptionsByConfigId(id);

    return toConfigurationDTO(
        configuration,
        groupOptionsByCategory(optionRows),
    );
}

export { getConfigurationById };
