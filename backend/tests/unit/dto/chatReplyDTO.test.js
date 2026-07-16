import { toChatReplyDTO } from "../../../services/chatbot/DTOs/chatReplyDTO.js";

describe("chatReplyDTO", () => {
    test("maps reply string", () => {
        expect(toChatReplyDTO({ reply: "Hello from ElectriCity" })).toEqual({
            reply: "Hello from ElectriCity",
        });
    });

    test("preserves empty reply", () => {
        expect(toChatReplyDTO({ reply: "" })).toEqual({ reply: "" });
    });
});
