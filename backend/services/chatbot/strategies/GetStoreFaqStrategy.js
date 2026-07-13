// Get store FAQ tool strategy

import { Type } from "@google/genai";
import ToolStrategy from "./helpers/ToolStrategy.js";
import { TOOLS, VALIDATIONS } from "../constants.js";
import { lookupStoreFaq } from "../faqDictionary.js";

/*
This class implements the get store FAQ tool strategy.
@class
@extends ToolStrategy
*/
class GetStoreFaqStrategy extends ToolStrategy {
    /**
     * This getter method returns the name of the tool.
     * @returns {string} Name of the tool.
     */
    get name() {
        return TOOLS.GET_STORE_FAQ;
    }

    /**
     * This getter method returns the declaration of the tool.
     * @returns {object} Declaration of the tool.
     */
    getDeclaration() {
        return {
            name: this.name,
            description:
                "Look up ElectriCity store FAQ answers about the website, finding products, account login, profile and account management (including delete account), cart, checkout, payments, reviews, and support. Use for general store questions; not for live catalog inventory.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    topic: {
                        type: Type.STRING,
                        description:
                            "FAQ topic id when the question clearly maps to one category.",
                        enum: VALIDATIONS.TOOL_ARGS.FAQ_TOPICS,
                    },
                    query: {
                        type: Type.STRING,
                        description:
                            "Free-text question or keywords when topic is unclear (e.g. how do I find cars, login help).",
                    },
                },
            },
        };
    }

    /**
     * This method executes the tool.
     * @param {object} args
     * @returns {Promise<object>}
     */
    async execute(args) {
        return lookupStoreFaq(args);
    }
}

export default new GetStoreFaqStrategy();
