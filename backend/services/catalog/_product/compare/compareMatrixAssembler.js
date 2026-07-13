// Compare Matrix Assembler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import { toComparisonMatrixDTO } from "../DTOs/comparisonMatrixDTO.js";

/**
 * This class is used to assemble the compare matrix.
 * @class
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class CompareMatrixAssembler {
    /**
     * This method is used to assemble the compare matrix.
     * @param {object[]} fieldSets
     * @returns {Promise<object>}
     */
    build(fieldSets) {
        // Union of all field keys to allow us to identify missing fields across items.
        const allFields = new Set(
            fieldSets.flatMap((s) => Object.keys(s.fields)),
        );

        // Create rows for each field.
        const rows = {};
        for (const field of allFields) {
            const cells = fieldSets.map(
                (s) => s.fields[field] ?? { value: null, direction: "none" },
            );

            const { winnerIndexes, tied } = this._pickBest(cells);
            const winners = new Set(winnerIndexes);
            const ranked = winnerIndexes.length > 0;

            // Create a row for each field.
            rows[field] = cells.map((cell, i) => {
                const isWinner = winners.has(i);
                return {
                    value: cell.value,
                    isBest: isWinner && !tied,
                    isTied: isWinner && tied,
                    isWorse: ranked && !isWinner,
                };
            });
        }

        // Create columns for each item.
        const columns = fieldSets.map((s) => ({ id: s.id, label: s.label }));
        return toComparisonMatrixDTO(columns, rows);
    }

    /**
     * This method is used to pick the best cell(s) for a given field.
     * @param {object[]} cells
     * @returns {{ winnerIndexes: number[], tied: boolean }}
     */
    _pickBest(cells) {
        // Find the direction of the best cell.
        const direction = cells.find(
            (c) => c.direction && c.direction !== "none",
        )?.direction;

        if (!direction) return { winnerIndexes: [], tied: false };

        // Find the best value for the given field.
        let bestValue = null;
        for (const cell of cells) {
            const value = this._comparableValue(cell.value);
            if (value === null) continue;
            if (bestValue === null) {
                bestValue = value;
                continue;
            }
            const better =
                direction === "lower" ? value < bestValue : value > bestValue;
            if (better) bestValue = value;
        }

        if (bestValue === null) return { winnerIndexes: [], tied: false };

        const winnerIndexes = [];
        cells.forEach((cell, i) => {
            const value = this._comparableValue(cell.value);
            if (value !== null && value === bestValue) {
                winnerIndexes.push(i);
            }
        });

        return {
            winnerIndexes,
            tied: winnerIndexes.length > 1,
        };
    }

    /**
     * Coerce numeric-looking values so year/mileage/price compare by magnitude,
     * not lexicographic string order (which breaks once digit lengths differ).
     * @param {unknown} value
     * @returns {number|string|null}
     */
    _comparableValue(value) {
        if (value === null || value === undefined) return null;
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === "bigint") {
            return Number(value);
        }
        if (typeof value === "string" && value.trim() !== "") {
            const asNumber = Number(value);
            if (Number.isFinite(asNumber)) return asNumber;
        }
        return value;
    }
}

export default CompareMatrixAssembler;
