import { jest } from "@jest/globals";
import { NotFoundError } from "../../../utils/errors.js";

const mockUpdateById = jest.fn();
const mockFindByIdForUser = jest.fn();
const mockDeleteById = jest.fn();
const mockSetDefault = jest.fn();

await jest.unstable_mockModule(
    "../../../services/iam/_identity/accountDAO.js",
    () => ({
        default: {},
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/_identity/addressDAO.js",
    () => ({
        default: {
            updateById: mockUpdateById,
            findByIdForUser: mockFindByIdForUser,
            deleteById: mockDeleteById,
            setDefault: mockSetDefault,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/EmailAdaptor.js",
    () => ({
        default: {},
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/_identity/identityQuery.js",
    () => ({
        getUserById: jest.fn(),
    }),
);

const { updateAddress, deleteAddress, setDefaultAddress } = await import(
    "../../../services/iam/_identity/identityMutation.js"
);

const addressRow = {
    address_id: 5,
    user_id: 1,
    street: "1 Main",
    city: "Toronto",
    province: "ON",
    country: "Canada",
    postal_code: "M5H2N2",
    is_default: 1,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
};

describe("identityMutation address catch paths", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("updateAddress returns DTO and rethrows failures", async () => {
        mockUpdateById.mockResolvedValueOnce(undefined);
        mockFindByIdForUser.mockResolvedValueOnce(addressRow);

        const updated = await updateAddress({
            userId: 1,
            addressId: 5,
            street: "2 Main",
        });
        expect(updated.address_id).toBe(5);

        mockUpdateById.mockRejectedValueOnce(new NotFoundError("Address"));
        await expect(
            updateAddress({ userId: 1, addressId: 5, city: "Ottawa" }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    test("deleteAddress returns id and rethrows failures", async () => {
        mockDeleteById.mockResolvedValueOnce(undefined);
        await expect(
            deleteAddress({ userId: 1, addressId: 5 }),
        ).resolves.toEqual({ address_id: 5 });

        mockDeleteById.mockRejectedValueOnce(new Error("delete failed"));
        await expect(
            deleteAddress({ userId: 1, addressId: 5 }),
        ).rejects.toThrow("delete failed");
    });

    test("setDefaultAddress returns DTO and rethrows failures", async () => {
        mockSetDefault.mockResolvedValueOnce(undefined);
        mockFindByIdForUser.mockResolvedValueOnce(addressRow);

        const row = await setDefaultAddress({ userId: 1, addressId: 5 });
        expect(row.is_default).toBe(true);

        mockSetDefault.mockRejectedValueOnce(new NotFoundError("Address"));
        await expect(
            setDefaultAddress({ userId: 1, addressId: 5 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
