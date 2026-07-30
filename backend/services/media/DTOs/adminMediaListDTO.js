/**
 * This converts a raw media row to an admin-friendly representable format,
 * handling potential null linked catalog items.
 *
 * @param {object} row The raw database row containing media data and joined catalog links
 * @returns {object} The standardized output payload
 */
function toAdminMediaListDTO(row) {
  return {
    media_id: Number(row.media_id),
    url: row.url,
    file_type: row.file_type,
    alt_text: row.alt_text,
    uploaded_at: row.uploaded_at,
    linked_cid: row.cid ? Number(row.cid) : null,
    is_primary: row.is_primary ? Boolean(row.is_primary) : false,
  };
}

export { toAdminMediaListDTO };
