// Chatbot Service (Facade)

import { sendMessage } from "./promptMutation.js";
import { TEMPLATES, TOOLS, VALIDATIONS, DEFAULTS, ROLES } from "./constants.js";

const chatbotService = {
    // Mutation
    sendMessage,

    // Constants
    TEMPLATES,
    TOOLS,
    VALIDATIONS,
    DEFAULTS,
    ROLES,
};

export default chatbotService;

export {
    // Mutations
    sendMessage,

    // Constants
    TEMPLATES,
    TOOLS,
    VALIDATIONS,
    DEFAULTS,
    ROLES,
};
