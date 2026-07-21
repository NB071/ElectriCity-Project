/**
 * This converts a top catalog item row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toTopCatalogItemDTO(row) {
  return {
    cid: Number(row.cid) || null,
    name: row.name,
    item_type: row.item_type,
    total: Number(row.total) || 0,
  };
}

export { toTopCatalogItemDTO };
