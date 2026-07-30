import { toAdminMediaListDTO } from "../../../services/media/DTOs/adminMediaListDTO.js";
import { toWishlistIdsDTO } from "../../../services/wishlist/DTOs/wishlistIdsDTO.js";
import { toVehicleFacetsDTO } from "../../../services/catalog/_product/DTOs/vehicleFacetsDTO.js";

describe("adminMediaListDTO", () => {
    test("maps linked catalog item and primary flag", () => {
        expect(
            toAdminMediaListDTO({
                media_id: "10",
                url: "https://cdn/a.jpg",
                file_type: "image/jpeg",
                alt_text: "Alt",
                uploaded_at: "2025-01-01",
                cid: "5",
                is_primary: 1,
            }),
        ).toEqual({
            media_id: 10,
            url: "https://cdn/a.jpg",
            file_type: "image/jpeg",
            alt_text: "Alt",
            uploaded_at: "2025-01-01",
            linked_cid: 5,
            is_primary: true,
        });
    });

    test("nulls missing cid and treats falsy primary as false", () => {
        expect(
            toAdminMediaListDTO({
                media_id: 2,
                url: "https://cdn/b.jpg",
                file_type: "image/png",
                alt_text: null,
                uploaded_at: "2025-01-02",
                cid: null,
                is_primary: 0,
            }),
        ).toMatchObject({
            linked_cid: null,
            is_primary: false,
        });
    });
});

describe("wishlistIdsDTO", () => {
    test("maps cid rows to number array", () => {
        expect(
            toWishlistIdsDTO([{ cid: "1" }, { cid: 2 }, { cid: "3" }]),
        ).toEqual({ cids: [1, 2, 3] });
    });

    test("returns empty cids for empty rows", () => {
        expect(toWishlistIdsDTO([])).toEqual({ cids: [] });
    });
});

describe("vehicleFacetsDTO", () => {
    test("maps all facet groups and coerces counts", () => {
        const dto = toVehicleFacetsDTO({
            total: "12",
            body_shape: [{ value: "sedan" }],
            condition: [{ value: "new", count: null }],
            drivetrain: [{ value: "AWD", count: undefined }],
            promo: [{ value: "sale" }],
        });

        expect(dto).toEqual({
            total: 12,
            body_shape: [{ value: "sedan", count: 0 }],
            condition: [{ value: "new", count: 0 }],
            drivetrain: [{ value: "AWD", count: 0 }],
            promo: [{ value: "sale", count: 0 }],
        });
    });

    test("omits missing facet groups and defaults total", () => {
        expect(toVehicleFacetsDTO({})).toEqual({ total: 0 });
        expect(toVehicleFacetsDTO({ total: 3 })).toEqual({ total: 3 });
    });
});
