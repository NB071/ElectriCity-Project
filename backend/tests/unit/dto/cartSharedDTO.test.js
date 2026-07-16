import {
    resolveUnitPrice,
    toCartCatalogItemDTO,
    toCartConfigurationOptionDTO,
    toCartConfigurationDTO,
} from "../../../services/cart/DTOs/cartSharedDTO.js";

describe("cartSharedDTO", () => {
    test("resolveUnitPrice uses config total when configured", () => {
        expect(
            resolveUnitPrice({
                config_id: 5,
                config_total_price: "52000",
                base_price: "45000",
            }),
        ).toBe(52000);
        expect(
            resolveUnitPrice({
                config_id: 5,
                total_price: "51000",
                base_price: "45000",
            }),
        ).toBe(51000);
        expect(resolveUnitPrice({ config_id: null, base_price: "45000" })).toBe(
            45000,
        );
    });

    test("toCartCatalogItemDTO maps catalog row with optional image", () => {
        const withImage = toCartCatalogItemDTO(
            {
                cid: 1,
                item_type: "vehicle",
                brand_name: "Tesla",
                model_name: "Model 3",
                base_price: "45999",
                stock: "3",
                is_active: 1,
                primary_image_url: "https://cdn/a.jpg",
            },
            [{ name: "Hot deal" }],
        );
        expect(withImage.name).toBe("Tesla Model 3");
        expect(withImage.stock).toBe(3);
        expect(withImage.is_active).toBe(true);
        expect(withImage.primary_image_url).toBe("https://cdn/a.jpg");
        expect(withImage.promotions).toHaveLength(1);

        const noImage = toCartCatalogItemDTO({
            cid: 2,
            item_type: "vehicle",
            brand_name: "Nissan",
            model_name: "Leaf",
            base_price: "30000",
            stock: 1,
            is_active: 0,
            primary_image_url: null,
        });
        expect(noImage.primary_image_url).toBeNull();
        expect(noImage.is_active).toBe(false);
    });

    test("toCartConfigurationOptionDTO name fallbacks", () => {
        expect(
            toCartConfigurationOptionDTO({
                category_id: 1,
                category_name: "Color",
                select_type: "SINGLE",
                option_id: 10,
                name: "Red",
                price_delta: "500",
            }).name,
        ).toBe("Red");

        expect(
            toCartConfigurationOptionDTO({
                category_id: 1,
                category_name: "Color",
                select_type: "SINGLE",
                option_id: 11,
                option_name: "Blue",
                price_delta: 0,
            }).name,
        ).toBe("Blue");

        expect(
            toCartConfigurationOptionDTO({
                category_id: 2,
                category_name: "Wheels",
                select_type: "MULTI",
                option_id: 12,
                value_name: "19 inch",
                price_delta: "1200",
            }).name,
        ).toBe("19 inch");
    });

    test("toCartConfigurationDTO returns null without config_id", () => {
        expect(toCartConfigurationDTO({ config_id: null })).toBeNull();
    });

    test("toCartConfigurationDTO maps config and nested options", () => {
        const dto = toCartConfigurationDTO(
            {
                config_id: 9,
                config_total_price: "47000",
                config_created_at: "2025-01-01T00:00:00.000Z",
            },
            [
                {
                    category_id: 1,
                    category_name: "Interior",
                    select_type: "SINGLE",
                    option_id: 3,
                    name: "White",
                    price_delta: 0,
                },
            ],
        );

        expect(dto.config_id).toBe(9);
        expect(dto.total_price).toBe(47000);
        expect(dto.created_at).toBe("2025-01-01T00:00:00.000Z");
        expect(dto.options[0].name).toBe("White");

        const fallbackDates = toCartConfigurationDTO(
            {
                config_id: 10,
                total_price: "48000",
                created_at: "2025-06-01T00:00:00.000Z",
            },
            [],
        );
        expect(fallbackDates.total_price).toBe(48000);
        expect(fallbackDates.created_at).toBe("2025-06-01T00:00:00.000Z");
        expect(fallbackDates.options).toEqual([]);
    });
});
