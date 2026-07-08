/**
 * This function maps an issued token pair to a representable format.
 * @param {object} tokens
 * @param {string} tokens.accessToken
 * @param {string} tokens.refreshToken
 * @returns {{ accessToken: string, refreshToken: string }}
 */
function toTokenPairDTO({ accessToken, refreshToken }) {
    return {
        accessToken,
        refreshToken,
    };
}

export { toTokenPairDTO };
