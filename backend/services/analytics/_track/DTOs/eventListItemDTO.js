/**
 * This converts an event list row to a representable format.
 * @param {object} row The event list row
 * @returns {object} The event list item in a representable format
 */
function toEventListItemDTO(row) {
  const catalogName =
    typeof row.catalog_name === "string" ? row.catalog_name.trim() : "";

  return {
    event_id: row.event_id,
    event_code: row.event_code,
    event_type_name: row.event_type_name,
    user_id: row.user_id,
    cid: row.cid,
    catalog_name: catalogName || null,
    ip: row.ip_address,
    generated_at: row.created_at,
  };
}

export { toEventListItemDTO };
