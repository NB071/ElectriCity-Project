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

            // Pick the best cell for each field.
            const bestIndex = this._pickBest(cells);

            // Create a row for each field.
            rows[field] = cells.map((cell, i) => ({
                value: cell.value,
                isBest: i === bestIndex,
            }));
        }

        // Create columns for each item.
        const columns = fieldSets.map((s) => ({ id: s.id, label: s.label }));
        return toComparisonMatrixDTO(columns, rows);
    }

    /**
     * This method is used to pick the best cell for a given field.
     * @param {object[]} cells
     * @returns {number}
     */
    _pickBest(cells) {
        // Find the direction of the best cell.
        const direction = cells.find(
            (c) => c.direction && c.direction !== "none",
        )?.direction;

        if (!direction) return -1;

        // Find the best cell for the given field.
        let bestIndex = -1;
        let bestValue = null;
        // Iterate through the cells and find the best cell.
        cells.forEach((cell, i) => {
            if (cell.value === null || cell.value === undefined) return;
            if (bestValue === null) {
                bestIndex = i;
                bestValue = cell.value;
                return;
            }
            const better =
                direction === "lower"
                    ? cell.value < bestValue
                    : cell.value > bestValue;
            if (better) {
                bestIndex = i;
                bestValue = cell.value;
            }
        });
        return bestIndex;
    }
}

export default CompareMatrixAssembler;
