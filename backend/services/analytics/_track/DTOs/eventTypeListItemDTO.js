/**
 * This converts an event type row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toEventTypeListItemDTO(row) {
  return {
    event_type_id: Number(row.event_type_id),
    code: row.code,
    name: row.name,
    description: row.description ?? null,
    is_active: Boolean(row.is_active),
  };
}

export { toEventTypeListItemDTO };
