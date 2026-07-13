import { toOrderDetailDTO } from "./orderDetailDTO.js";

/**
 * This function maps full order detail fields to an admin representable format, including the owner.
 * @param {object} input Same shape as toOrderDetailDTO's input, plus order.user_id/guest_email/first_name/last_name/email
 * @returns {object}
 */
function toAdminOrderDetailDTO(input) {
    const dto = {
        ...toOrderDetailDTO(input),
        user_id: input.order.user_id,
        guest_email: input.order.guest_email ?? null,
    };

    if (input.order.email != null) {
        dto.user = {
            user_id: input.order.user_id,
            first_name: input.order.first_name,
            last_name: input.order.last_name,
            email: input.order.email,
        };
    }

    return dto;
}

export { toAdminOrderDetailDTO };
