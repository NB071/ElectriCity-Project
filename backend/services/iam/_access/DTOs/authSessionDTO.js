import { toUserDTO } from "../../_identity/DTOs/userDTO.js";

/**
 * This function maps an authentication session to a representable format.
 * @param {object} session
 * @param {string} session.accessToken
 * @param {string} session.refreshToken
 * @param {object} session.user DAO user row (password_hash is excluded)
 * @returns {{ accessToken: string, refreshToken: string, user: object }}
 */
function toAuthSessionDTO({ accessToken, refreshToken, user }) {
    return {
        accessToken,
        refreshToken,
        user: toUserDTO(user),
    };
}

export { toAuthSessionDTO };
