/**
 * This converts an event type breakdown row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toEventTypeBreakdownDTO(row) {
  return {
    event_type_id: Number(row.event_type_id),
    code: row.code,
    name: row.name,
    total: Number(row.total) || 0,
  };
}

export { toEventTypeBreakdownDTO };
