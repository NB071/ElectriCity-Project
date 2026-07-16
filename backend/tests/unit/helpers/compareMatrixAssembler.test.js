import CompareMatrixAssembler from "../../../services/catalog/_product/compare/compareMatrixAssembler.js";

describe("CompareMatrixAssembler", () => {
    const assembler = new CompareMatrixAssembler();

    test("ranks higher-is-better fields and marks winner", () => {
        const matrix = assembler.build([
            {
                id: 1,
                label: "A",
                fields: { range: { value: 300, direction: "higher" } },
            },
            {
                id: 2,
                label: "B",
                fields: { range: { value: 400, direction: "higher" } },
            },
        ]);

        const row = matrix.rows.find((r) => r.field === "range");
        expect(row.cells[0].isBest).toBe(false);
        expect(row.cells[0].isWorse).toBe(true);
        expect(row.cells[1].isBest).toBe(true);
        expect(row.cells[1].isTied).toBe(false);
        expect(matrix.columns).toEqual([
            { id: 1, label: "A" },
            { id: 2, label: "B" },
        ]);
    });

    test("ranks lower-is-better fields (mileage)", () => {
        const matrix = assembler.build([
            {
                id: 1,
                label: "Used",
                fields: { mileage: { value: "12000", direction: "lower" } },
            },
            {
                id: 2,
                label: "New",
                fields: { mileage: { value: 0, direction: "lower" } },
            },
        ]);

        const row = matrix.rows.find((r) => r.field === "mileage");
        expect(row.cells[1].isBest).toBe(true);
        expect(row.cells[0].isWorse).toBe(true);
    });

    test("marks tied winners when values match", () => {
        const matrix = assembler.build([
            {
                id: 1,
                label: "X",
                fields: { price: { value: 50000, direction: "lower" } },
            },
            {
                id: 2,
                label: "Y",
                fields: { price: { value: 50000, direction: "lower" } },
            },
        ]);

        const row = matrix.rows.find((r) => r.field === "price");
        expect(row.cells[0].isTied).toBe(true);
        expect(row.cells[1].isTied).toBe(true);
        expect(row.cells[0].isBest).toBe(false);
    });

    test("fills missing fields and none-direction rows stay neutral", () => {
        const matrix = assembler.build([
            {
                id: 1,
                label: "Only A",
                fields: { color: { value: "Red", direction: "none" } },
            },
            {
                id: 2,
                label: "Only B",
                fields: {},
            },
        ]);

        const row = matrix.rows.find((r) => r.field === "color");
        expect(row.cells).toHaveLength(2);
        expect(row.cells[0].value).toBe("Red");
        expect(row.cells[0].isBest).toBe(false);
        expect(row.cells[0].isWorse).toBe(false);
        expect(row.cells[1].value).toBeNull();
    });

    test("_comparableValue coercions via package-private behavior", () => {
        expect(assembler._comparableValue(null)).toBeNull();
        expect(assembler._comparableValue(undefined)).toBeNull();
        expect(assembler._comparableValue(Number.NaN)).toBeNull();
        expect(assembler._comparableValue(42)).toBe(42);
        expect(assembler._comparableValue(100n)).toBe(100);
        expect(assembler._comparableValue(" 2024 ")).toBe(2024);
        expect(assembler._comparableValue("")).toBe("");
        expect(assembler._comparableValue("blue")).toBe("blue");
    });

    test("all-null numeric cells produce no winner", () => {
        const matrix = assembler.build([
            {
                id: 1,
                label: "A",
                fields: { score: { value: null, direction: "higher" } },
            },
            {
                id: 2,
                label: "B",
                fields: { score: { value: undefined, direction: "higher" } },
            },
        ]);

        const row = matrix.rows.find((r) => r.field === "score");
        expect(row.cells.every((c) => !c.isBest && !c.isWorse)).toBe(true);
    });
});
