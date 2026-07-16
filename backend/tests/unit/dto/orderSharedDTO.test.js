import {
    resolveOrderItemUnitPrice,
    toOrderConfigurationOptionDTO,
    toOrderCatalogItemDTO,
    toOrderConfigurationDTO,
    toOrderAddressDTO,
} from "../../../services/order/DTOs/orderSharedDTO.js";

describe("orderSharedDTO", () => {
    test("resolveOrderItemUnitPrice coerces number", () => {
        expect(resolveOrderItemUnitPrice({ unit_price: "199.99" })).toBe(
            199.99,
        );
    });

    test("toOrderCatalogItemDTO maps catalog fields", () => {
        const dto = toOrderCatalogItemDTO({
            cid: 1,
            item_type: "vehicle",
            brand_name: "Tesla",
            model_name: "Model 3",
            base_price: "45999",
            is_active: 1,
        });

        expect(dto.name).toBe("Tesla Model 3");
        expect(dto.base_price).toBe(45999);
        expect(dto.is_active).toBe(true);
    });

    test("toOrderConfigurationOptionDTO maps option row", () => {
        const dto = toOrderConfigurationOptionDTO({
            category_id: 2,
            category_name: "Paint",
            select_type: "SINGLE",
            option_id: 9,
            option_name: "Red Multi-Coat",
            price_delta: "1500",
        });

        expect(dto.name).toBe("Red Multi-Coat");
        expect(dto.price_delta).toBe(1500);
    });

    test("toOrderConfigurationDTO returns null without config_id", () => {
        expect(toOrderConfigurationDTO({ config_id: null })).toBeNull();
        expect(toOrderConfigurationDTO({ config_id: undefined })).toBeNull();
    });

    test("toOrderConfigurationDTO maps config and nested options", () => {
        const dto = toOrderConfigurationDTO(
            {
                config_id: 44,
                config_total_price: "48000",
                config_created_at: "2025-01-01T00:00:00.000Z",
            },
            [
                {
                    category_id: 1,
                    category_name: "Wheels",
                    select_type: "SINGLE",
                    option_id: 3,
                    option_name: "19 inch",
                    price_delta: "1200",
                },
            ],
        );

        expect(dto.config_id).toBe(44);
        expect(dto.total_price).toBe(48000);
        expect(dto.options).toHaveLength(1);
        expect(dto.options[0].name).toBe("19 inch");
    });

    test("toOrderConfigurationDTO defaults options to empty array", () => {
        const dto = toOrderConfigurationDTO({
            config_id: 7,
            config_total_price: "100",
            config_created_at: "2025-02-01T00:00:00.000Z",
        });
        expect(dto.options).toEqual([]);
    });

    test("toOrderAddressDTO null-coalesces phone_number", () => {
        expect(
            toOrderAddressDTO({
                address_type: "shipping",
                full_name: "A",
                phone_number: "4165550100",
                street: "1 Main",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postal_code: "M5H2N2",
            }).phone_number,
        ).toBe("4165550100");

        expect(
            toOrderAddressDTO({
                address_type: "billing",
                full_name: "A",
                phone_number: undefined,
                street: "1 Main",
                city: "Toronto",
                province: "ON",
                country: "Canada",
                postal_code: "M5H2N2",
            }).phone_number,
        ).toBeNull();
    });
});
