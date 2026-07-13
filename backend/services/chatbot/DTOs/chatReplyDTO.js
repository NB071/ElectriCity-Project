/**
 * Public chat response. Assistant reply only (no system prompt or tool internals).
 * @param {object} data
 * @param {string} data.reply
 * @returns {{ reply: string }}
 */
function toChatReplyDTO({ reply }) {
    return { reply };
}

export { toChatReplyDTO };
