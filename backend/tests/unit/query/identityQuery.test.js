import { jest } from "@jest/globals";
import { ValidationError, NotFoundError } from "../../../utils/errors.js";

const mockFindById = jest.fn();
const mockCountAllUsers = jest.fn();
const mockFindAllUsers = jest.fn();
const mockCountSearchUsers = jest.fn();
const mockSearchUsers = jest.fn();
const mockCountByUserId = jest.fn();
const mockFindByUserId = jest.fn();
const mockFindByIdForUser = jest.fn();

await jest.unstable_mockModule(
    "../../../services/iam/_identity/accountDAO.js",
    () => ({
        default: {
            findById: mockFindById,
            countAllUsers: mockCountAllUsers,
            findAllUsers: mockFindAllUsers,
            countSearchUsers: mockCountSearchUsers,
            searchUsers: mockSearchUsers,
        },
    }),
);

await jest.unstable_mockModule(
    "../../../services/iam/_identity/addressDAO.js",
    () => ({
        default: {
            countByUserId: mockCountByUserId,
            findByUserId: mockFindByUserId,
            findByIdForUser: mockFindByIdForUser,
        },
    }),
);

const {
    getUserById,
    viewAllUsers,
    searchUsers,
    getUserAddresses,
    getUserAddress,
} = await import("../../../services/iam/_identity/identityQuery.js");

const userRow = {
    user_id: 1,
    role: "customer",
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@test.com",
    phone_number: null,
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
};

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

describe("identityQuery", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getUserById returns user and rethrows failures", async () => {
        mockFindById.mockResolvedValueOnce(userRow);
        const user = await getUserById(1);
        expect(user.user_id).toBe(1);

        mockFindById.mockResolvedValueOnce(userRow);
        await getUserById(1, { fields: ["email"] });
        expect(mockFindById).toHaveBeenLastCalledWith(1, ["email"]);

        mockFindById.mockRejectedValueOnce(new NotFoundError("User"));
        await expect(getUserById(1)).rejects.toBeInstanceOf(NotFoundError);
    });

    test("viewAllUsers rejects invalid pagination and returns list", async () => {
        await expect(viewAllUsers({ page: 0 })).rejects.toBeInstanceOf(
            ValidationError,
        );

        mockCountAllUsers.mockResolvedValue(1);
        mockFindAllUsers.mockResolvedValue([userRow]);
        const result = await viewAllUsers({ page: 1, limit: 10 });
        expect(result.items).toHaveLength(1);
        expect(result.pagination.total).toBe(1);

        mockCountAllUsers.mockResolvedValue(0);
        mockFindAllUsers.mockResolvedValue([]);
        await expect(viewAllUsers()).resolves.toMatchObject({
            items: [],
            pagination: { total: 0 },
        });
    });

    test("searchUsers rejects invalid pagination and returns matches", async () => {
        await expect(searchUsers({ page: -1, q: "ada" })).rejects.toBeInstanceOf(
            ValidationError,
        );

        mockCountSearchUsers.mockResolvedValue(1);
        mockSearchUsers.mockResolvedValue([userRow]);
        const result = await searchUsers({ q: "ada", page: 1, limit: 10 });
        expect(result.q).toBe("ada");
        expect(result.items).toHaveLength(1);

        mockCountSearchUsers.mockResolvedValue(0);
        mockSearchUsers.mockResolvedValue([]);
        await expect(searchUsers({ q: "x" })).resolves.toMatchObject({
            items: [],
            q: "x",
        });

        await expect(searchUsers()).rejects.toBeInstanceOf(ValidationError);
    });

    test("getUserAddresses skips find when total is 0", async () => {
        mockCountByUserId.mockResolvedValue(0);
        const result = await getUserAddresses(1);
        expect(result.items).toEqual([]);
        expect(mockFindByUserId).not.toHaveBeenCalled();
    });

    test("getUserAddresses fetches rows when total > 0", async () => {
        mockCountByUserId.mockResolvedValue(1);
        mockFindByUserId.mockResolvedValue([addressRow]);
        const result = await getUserAddresses(1, { page: 1, limit: 5 });
        expect(result.items).toHaveLength(1);
        expect(mockFindByUserId).toHaveBeenCalledWith(1, 5, 0);
    });

    test("getUserAddresses rejects invalid pagination", async () => {
        await expect(
            getUserAddresses(1, { page: 0 }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("getUserAddress returns mapped address and rethrows", async () => {
        mockFindByIdForUser.mockResolvedValueOnce(addressRow);
        const address = await getUserAddress({ userId: 1, addressId: 5 });
        expect(address.address_id).toBe(5);

        mockFindByIdForUser.mockRejectedValueOnce(new NotFoundError("Address"));
        await expect(
            getUserAddress({ userId: 1, addressId: 5 }),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
