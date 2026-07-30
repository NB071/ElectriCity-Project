/**
 * This function maps a brand row to a lite filter representation (id + name only).
 * @param {object} row DAO brand row
 * @returns {{ id: number, name: string }}
 */
function toBrandLiteDTO(row) {
    return {
        id: row.brand_id,
        name: row.name,
    };
}

export { toBrandLiteDTO };
