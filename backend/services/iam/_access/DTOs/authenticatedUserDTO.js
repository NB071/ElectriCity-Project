/**
 * This function maps verified token claims and user data to a epresentable format.
 * @param {object} data
 * @param {object} data.user DAO user row from accountDAO.findById
 * @param {string} data.jti Access token JWT ID
 * @param {number} data.exp Access token expiry (unix seconds)
 * @param {string} [data.sid] Session id from the access token claims
 * @returns {{
 *   user_id: number,
 *   role: string,
 *   email: string,
 *   jti: string,
 *   exp: number,
 *   sid: string
 * }}
 */
function toAuthenticatedUserDTO({ user, jti, exp, sid }) {
    return {
        user_id: user.user_id,
        role: user.role ?? user.role_name,
        email: user.email,
        jti,
        exp,
        sid,
    };
}

export { toAuthenticatedUserDTO };
