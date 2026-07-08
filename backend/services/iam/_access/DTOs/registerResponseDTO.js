import { toUserDTO } from "../../_identity/DTOs/userDTO.js";

/**
 * This function maps a newly created user row to a representable format.
 * Reuses identity user DTO so register and /me share the same user shape.
 * @param {object} row DAO row from accountDAO.create
 * @returns {object}
 */
function toRegisterResponseDTO(row) {
    return toUserDTO(row);
}

export { toRegisterResponseDTO };
