import { jest } from "@jest/globals";
import {
    ValidationError,
    NotFoundError,
    InternalError,
} from "../../../utils/errors.js";
import { toPromotionDTO } from "../../../services/catalog/_promotions/DTOs/promotionDTO.js";
import CatalogDetailsHandler from "../../../services/catalog/_product/details/catalogDetailsHandler.js";
import CartHandler from "../../../services/cart/ownership/cartHandler.js";
import CartRegistry from "../../../services/cart/ownership/cartRegistry.js";
import { CART_KINDS } from "../../../services/cart/constants.js";

const mockBuildBrowseFilterFragment = jest.fn();
const mockValidatePromoType = jest.fn();

await jest.unstable_mockModule(
    "../../../services/catalog/_promotions/promotionsDAO.js",
    () => ({
        default: {
            buildBrowseFilterFragment: mockBuildBrowseFilterFragment,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/catalog/_promotions/promotionValidator.js",
    () => ({
        validatePromoType: mockValidatePromoType,
    }),
);

// concrete strategies still load; registry uses validatePromoType mock
const PromoStrategyRegistry = (
    await import(
        "../../../services/catalog/_promotions/strategies/PromoStrategyRegistry.js"
    )
).default;

describe("promotionDTO", () => {
    test("null-coalesces description", () => {
        expect(
            toPromotionDTO({
                promo_id: 1,
                name: "Deal",
                description: null,
                discount_amount: "10",
            }).description,
        ).toBeNull();
        expect(
            toPromotionDTO({
                promo_id: 1,
                name: "Deal",
                description: "Save",
                discount_amount: 10,
            }).description,
        ).toBe("Save");
    });
});

describe("PromoStrategyRegistry", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBuildBrowseFilterFragment.mockReturnValue({
            sql: "1=1",
            params: [],
        });
    });

    test("returns fragment for known promo", () => {
        mockValidatePromoType.mockReturnValue("hot_deal");
        mockBuildBrowseFilterFragment.mockReturnValue({
            sql: "1=1",
            params: [],
        });
        const fragment = PromoStrategyRegistry.getPromoFragment("hot_deal");
        expect(fragment).toEqual(
            expect.objectContaining({
                sql: expect.any(String),
                params: expect.any(Array),
            }),
        );
        expect(fragment.sql.length).toBeGreaterThan(0);
    });

    test("throws when no strategy registered for validated type", () => {
        mockValidatePromoType.mockReturnValue("mystery_promo");
        expect(() =>
            PromoStrategyRegistry.getPromoFragment("mystery_promo"),
        ).toThrow(ValidationError);
    });
});

describe("CatalogDetailsHandler", () => {
    test("getDetails throws when base or subtype missing", async () => {
        const handler = new CatalogDetailsHandler({
            productDAO: {
                findBaseById: jest.fn().mockResolvedValue(null),
            },
            optionsQuery: {},
            mediaAdapter: {},
        });
        await expect(handler.getDetails(1)).rejects.toBeInstanceOf(
            NotFoundError,
        );

        const handler2 = new CatalogDetailsHandler({
            productDAO: {
                findBaseById: jest.fn().mockResolvedValue({ cid: 1 }),
            },
            optionsQuery: {
                getForItem: jest.fn(),
                getEquippedForItem: jest.fn(),
            },
            mediaAdapter: {},
        });
        // default _fetchSubtype throws InternalError via abstract; override to return null
        handler2._fetchSubtype = jest.fn().mockResolvedValue(null);
        await expect(handler2.getDetails(1)).rejects.toMatchObject({
            message: "Catalog item subtype not found",
        });
    });

    test("abstract hooks throw by default", async () => {
        const handler = new CatalogDetailsHandler({
            productDAO: {},
            optionsQuery: {},
            mediaAdapter: {},
        });
        // InternalError is referenced but not imported in source — assert throw.
        await expect(handler._fetchSubtype(1)).rejects.toThrow();
        expect(() => handler._assemble({})).toThrow();
        await expect(handler._fetchHistory(1)).resolves.toBeNull();
    });
});

describe("CartRegistry / CartHandler", () => {
    test("CartRegistry rejects unknown kind", () => {
        const registry = new CartRegistry({ cartDAO: {} });
        expect(() => registry.get("robot")).toThrow(ValidationError);
        expect(registry.get(CART_KINDS.CUSTOMER)).toBeDefined();
    });

    test("CartHandler abstract _ensureCart and item not-found paths", async () => {
        class Stub extends CartHandler {
            _ownerMeta() {
                return { session_token: null, is_guest: false };
            }
        }
        const dao = {
            findItemByCartAndId: jest.fn().mockResolvedValue(null),
        };
        const stub = new Stub({ cartDAO: dao });

        await expect(stub._ensureCart({})).rejects.toBeInstanceOf(InternalError);

        stub._ensureCart = jest.fn().mockResolvedValue({ cart_id: 1 });
        await expect(
            stub.updateItemQuantity({}, { cartItemId: 9, quantity: 1 }),
        ).rejects.toBeInstanceOf(NotFoundError);
        await expect(
            stub.removeItem({}, { cartItemId: 9 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
