/**
 * This function maps the comparison matrix to a representable format.
 * @param {object[]} columns Comparison matrix columns
 * @param {object} rows Comparison matrix rows
 * @returns {object}
 */
function toComparisonMatrixDTO(columns, rows) {
    return {
        columns,
        rows: Object.entries(rows).map(([field, cells]) => ({
            field,
            cells,
        })),
    };
}

export { toComparisonMatrixDTO };
