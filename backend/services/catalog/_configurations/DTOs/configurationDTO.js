/**
 * This function converts a configuration to a DTO.
 * @param {object} configuration
 * @param {object[]} customizationCategories
 * @returns {object}
 */
function toConfigurationDTO(configuration, customizationCategories) {
    return {
        config_id: configuration.config_id,
        catalog_item_id: configuration.cid,
        total_price: Number(configuration.total_price),
        created_at: configuration.created_at,
        options: customizationCategories,
    };
}

export { toConfigurationDTO };
