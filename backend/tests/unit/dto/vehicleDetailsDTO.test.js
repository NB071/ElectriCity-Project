import { toVehicleDetailsDTO } from "../../../services/catalog/_product/DTOs/vehicleDetailsDTO.js";

const base = {
    cid: 1,
    item_type: "vehicle",
    brand_id: 10,
    brand_name: "Tesla",
    brand_country: "USA",
    model_id: 20,
    model_name: "Model 3",
    model_description: "Electric sedan",
    base_price: "45999.00",
    quantity: 5,
    is_active: 1,
    release_year: 2024,
};

const subtype = {
    year: 2024,
    condition: "new",
    mileage: 0,
    body_shape: "sedan",
    door_count: 4,
    drivetrain: "AWD",
};

describe("vehicleDetailsDTO", () => {
    test("maps full vehicle with history report and images", () => {
        const dto = toVehicleDetailsDTO(
            base,
            subtype,
            [{ category_id: 1, options: [] }],
            [{ option_id: 99, name: "Premium audio" }],
            { has_accidents: 0, owners_count: 1 },
            [
                {
                    media_id: 7,
                    url: "https://cdn/a.jpg",
                    alt_text: "Front",
                    display_order: 1,
                    is_primary: 1,
                },
                {
                    media_id: 8,
                    url: "https://cdn/b.jpg",
                    alt_text: null,
                    is_primary: 0,
                },
            ],
            {
                media_id: 50,
                url: "https://cdn/report.pdf",
                alt_text: "History",
            },
            [{ name: "Featured" }],
            { review_count: 3, avg_rating: "4.5" },
        );

        expect(dto.id).toBe(1);
        expect(dto.name).toBe("Tesla Model 3");
        expect(dto.base_price).toBe(45999);
        expect(dto.is_active).toBe(true);
        expect(dto.review_count).toBe(3);
        expect(dto.avg_rating).toBe(4.5);
        expect(dto.equipped_options).toHaveLength(1);
        expect(dto.promotions).toHaveLength(1);
        expect(dto.history.has_accidents).toBe(false);
        expect(dto.history.owners_count).toBe(1);
        expect(dto.history.report.url).toBe("https://cdn/report.pdf");
        expect(dto.images[0].is_primary).toBe(true);
        expect(dto.images[0].display_order).toBe(1);
        expect(dto.images[1].alt_text).toBeNull();
        expect(dto.images[1].display_order).toBe(0);
    });

    test("omits history block and uses defaults when optional data missing", () => {
        const dto = toVehicleDetailsDTO(base, subtype, [], [], null);

        expect(dto.history).toBeNull();
        expect(dto.images).toEqual([]);
        expect(dto.promotions).toEqual([]);
        expect(dto.review_count).toBe(0);
        expect(dto.avg_rating).toBeNull();
    });

    test("history without report and missing owners_count defaults to zero", () => {
        const dto = toVehicleDetailsDTO(
            base,
            subtype,
            [],
            [],
            { has_accidents: 1 },
            [],
            null,
        );

        expect(dto.history.has_accidents).toBe(true);
        expect(dto.history.owners_count).toBe(0);
        expect(dto.history.report).toBeNull();
    });
});
