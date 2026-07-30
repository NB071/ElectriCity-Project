/**
 * This function maps vehicle facet counts to a representable format.
 * @param {object} data
 * @param {number} data.total
 * @param {object[]} [data.body_shape]
 * @param {object[]} [data.condition]
 * @param {object[]} [data.drivetrain]
 * @param {object[]} [data.promo]
 * @returns {object}
 */
function toVehicleFacetsDTO(data) {
    const dto = {
        total: Number(data.total ?? 0),
    };

    if (data.body_shape) {
        dto.body_shape = data.body_shape.map((entry) => ({
            value: entry.value,
            count: Number(entry.count ?? 0),
        }));
    }

    if (data.condition) {
        dto.condition = data.condition.map((entry) => ({
            value: entry.value,
            count: Number(entry.count ?? 0),
        }));
    }

    if (data.drivetrain) {
        dto.drivetrain = data.drivetrain.map((entry) => ({
            value: entry.value,
            count: Number(entry.count ?? 0),
        }));
    }

    if (data.promo) {
        dto.promo = data.promo.map((entry) => ({
            value: entry.value,
            count: Number(entry.count ?? 0),
        }));
    }

    return dto;
}

export { toVehicleFacetsDTO };
