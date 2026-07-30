/**
 * This function maps a model database row to a brand models list representation.
 * @param {object} row DAO model row
 * @returns {{ id: number, name: string, release_year: number|null }}
 */
function toBrandModelListItemDTO(row) {
    return {
        id: row.model_id,
        name: row.name,
        release_year: row.release_year != null ? Number(row.release_year) : null,
    };
}

export { toBrandModelListItemDTO };
