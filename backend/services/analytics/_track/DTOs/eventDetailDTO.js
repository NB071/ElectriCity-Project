/**
 * This helper function parses the metadata of an event.
 * @helper_function
 * @private
 * @param {object} meta The metadata of an event
 * @returns {object} The parsed metadata
 */
function parseMeta(meta) {
  if (meta == null) {
    return {};
  }

  if (typeof meta === "string") {
    return JSON.parse(meta);
  }

  return meta;
}

/**
 * This converts an event details row to a representable format.
 * @param {object} row The event details
 * @returns {object} The event details in a representable format
 */
function toEventDetailDTO(row) {
  const meta = parseMeta(row.meta);

  let cid = null;
  if (row.cid != null) {
    cid = {
      cid: row.cid,
      item_type: row.item_type,
      base_price: row.base_price,
      quantity: row.quantity,
      is_active: Boolean(row.is_active),
      brand: row.brand_name,
      model: row.model_name,
      model_type: row.model_type,
    };

    if (row.vehicle_year != null || row.vehicle_condition != null) {
      cid.vehicle = {
        year: row.vehicle_year,
        condition: row.vehicle_condition,
        mileage: row.vehicle_mileage,
      };
    }
  }

  return {
    event_id: row.event_id,
    event_code: row.event_code,
    event_type_name: row.event_type_name,
    user_id: row.user_id,
    cid,
    meta,
    ip: row.ip_address,
    generated_at: row.created_at,
  };
}

export { toEventDetailDTO };
