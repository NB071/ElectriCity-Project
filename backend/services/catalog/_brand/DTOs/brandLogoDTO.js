/**
 * This function maps joined logo media columns to a nested logo object.
 * @param {object} row DAO brand row (with optional logo_* aliases from media join)
 * @returns {object|null}
 */
function toBrandLogoDTO(row) {
    if (row.media_id == null) {
        return null;
    }

    return {
        media_id: Number(row.media_id),
        url: row.logo_url ?? null,
        file_type: row.logo_file_type ?? null,
        alt_text: row.logo_alt_text ?? null,
    };
}

export { toBrandLogoDTO };
