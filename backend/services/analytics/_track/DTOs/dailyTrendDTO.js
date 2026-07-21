/**
 * This converts a daily trend row to a representable format.
 * @param {object} row
 * @returns {object}
 */
function toDailyTrendDTO(row) {
  let dateObj = row.day instanceof Date ? row.day : new Date(row.day);

  return {
    day: dateObj.toISOString().split("T")[0],
    total: Number(row.total) || 0,
  };
}

export { toDailyTrendDTO };
