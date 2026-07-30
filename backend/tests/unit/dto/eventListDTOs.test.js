import { toEventListItemDTO } from "../../../services/analytics/_track/DTOs/eventListItemDTO.js";
import { toEventTypeListItemDTO } from "../../../services/analytics/_track/DTOs/eventTypeListItemDTO.js";

describe("event list DTOs", () => {
    test("toEventListItemDTO trims catalog_name and nulls blank values", () => {
        const trimmed = toEventListItemDTO({
            event_id: 1,
            event_code: "cart.add",
            event_type_name: "Cart Add",
            user_id: 7,
            cid: 3,
            catalog_name: "  Tesla Model 3  ",
            ip_address: "127.0.0.1",
            created_at: "2025-01-01T00:00:00.000Z",
        });

        expect(trimmed.catalog_name).toBe("Tesla Model 3");
        expect(trimmed.ip).toBe("127.0.0.1");
        expect(trimmed.generated_at).toBe("2025-01-01T00:00:00.000Z");

        const blank = toEventListItemDTO({
            event_id: 2,
            event_code: "iam.edit",
            event_type_name: "Edit Profile",
            user_id: null,
            cid: null,
            catalog_name: "   ",
            ip_address: null,
            created_at: "2025-02-01",
        });

        expect(blank.catalog_name).toBeNull();
        expect(blank.ip).toBeNull();
    });

    test("toEventListItemDTO nulls non-string catalog_name", () => {
        const dto = toEventListItemDTO({
            event_id: 3,
            event_code: "catalog.view",
            event_type_name: "View",
            user_id: 1,
            cid: 2,
            catalog_name: null,
            ip_address: "10.0.0.1",
            created_at: "2025-03-01",
        });

        expect(dto.catalog_name).toBeNull();
    });

    test("toEventTypeListItemDTO coerces ids, booleans, and null description", () => {
        const active = toEventTypeListItemDTO({
            event_type_id: "5",
            code: "cart.add",
            name: "Cart Add",
            description: "Adds item to cart",
            is_active: 1,
        });

        expect(active).toEqual({
            event_type_id: 5,
            code: "cart.add",
            name: "Cart Add",
            description: "Adds item to cart",
            is_active: true,
        });

        const inactive = toEventTypeListItemDTO({
            event_type_id: 6,
            code: "legacy.event",
            name: "Legacy",
            description: null,
            is_active: 0,
        });

        expect(inactive.description).toBeNull();
        expect(inactive.is_active).toBe(false);
    });
});
