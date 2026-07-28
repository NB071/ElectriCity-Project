/**
 * This function maps a session database row to a represtable format.
 * @param {object} row DAO row
 * @param {string} [currentSessionId] Session id of the authenticated request
 * @returns {{
 *   session_id: string,
 *   device_label: string|null,
 *   ip_address: string|null,
 *   user_agent: string|null,
 *   last_seen_at: Date|string,
 *   created_at: Date|string,
 *   is_current: boolean
 * }}
 */
function toSessionDTO(row, currentSessionId) {
    return {
        session_id: row.session_id,
        device_label: row.device_label ?? null,
        ip_address: row.ip_address ?? null,
        user_agent: row.user_agent ?? null,
        last_seen_at: row.last_seen_at,
        created_at: row.created_at,
        is_current: row.session_id === currentSessionId,
    };
}

/**
 * This function maps session rows to a represtable format.
 * @param {object[]} rows DAO rows
 * @param {string} [currentSessionId] Session id of the authenticated request
 * @returns {{ sessions: object[] }}
 */
function toSessionListDTO(rows, currentSessionId) {
    const sessions = rows
        .map((row) => toSessionDTO(row, currentSessionId))
        .sort((a, b) => {
            if (a.is_current !== b.is_current) {
                return a.is_current ? -1 : 1;
            }
            return new Date(b.last_seen_at) - new Date(a.last_seen_at);
        });

    return { sessions };
}

export { toSessionDTO, toSessionListDTO };
