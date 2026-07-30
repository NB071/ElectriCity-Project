/**
 * This function formats a number to a compact notation.
 * @param {number} num The number to format
 * @returns {string} The formatted number
 * @example
 * formatNumber(1000) // "1k"
 * formatNumber(1000000) // "1M"
 * formatNumber(1000000000) // "1B"
 */
function formatNumber(num: number): string {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(num);
}

export default formatNumber;
