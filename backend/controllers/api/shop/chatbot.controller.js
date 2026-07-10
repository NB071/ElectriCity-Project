import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";
import chatbotService from "../../../services/chatbot/chatbot.service.js";

/**
 * This controller sends a message to the chatbot.
 * @route POST /api/shop/chatbot/message
 * @requiredRole N/A
 * @services_used Chatbot/Catalog
 */
export const sendMessageController = tryCatch(async (req, res) => {
    const { template, userMessage, vars, context } = req.body;
    const responseData = await chatbotService.sendMessage({
        template,
        userMessage,
        vars,
        context,
    });

    return apiResponse(res, responseData, 200);
});
