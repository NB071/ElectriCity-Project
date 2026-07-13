// Cart service tests
// script: npm run test:cart

import cartService from "../../services/cart/cart.service.js";
import {
    validateAddToCart,
    validateUpdateCartItem,
    validateCartItemRef,
    validateMergeGuestCart,
    validateCartItemId,
    validateCatalogItemId,
    validateUserId,
} from "../../services/cart/cartValidator.js";
import { resolveCartKind } from "../../services/cart/helpers/resolveCartKind.js";
import { CART_KINDS, VALIDATIONS } from "../../services/cart/constants.js";
import authnMiddleware from "../../middlewares/authn.middleware.js";
import iamService from "../../services/iam/iam.service.js";
import getPool from "../../configs/db.js";
import {
    ValidationError,
    UnauthorizedError,
    NotFoundError,
} from "../../utils/errors.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

const ACTIVE_CID = 1;
const OTHER_CONFIG_ID = 2;
const MATCHING_CONFIG_ID = 1;

async function runMiddleware(middleware, req) {
    return new Promise((resolve, reject) => {
        middleware(req, {}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(req);
            }
        });
    });
}

function testCartValidators() {
    const added = validateAddToCart({
        cid: ACTIVE_CID,
        quantity: 2,
    });
    assert(added.userId === null, "guest add may omit userId");
    assert(added.sessionToken === null, "guest add may omit sessionToken");
    assert(added.quantity === 2, "quantity should parse");

    const defaultQty = validateAddToCart({ cid: ACTIVE_CID });
    assert(defaultQty.quantity === 1, "default quantity should be 1");

    try {
        validateAddToCart({ cid: ACTIVE_CID, quantity: 0 });
        throw new Error("Expected quantity min validation to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "quantity below min should throw ValidationError",
        );
    }

    try {
        validateAddToCart({
            cid: ACTIVE_CID,
            quantity: VALIDATIONS.QUANTITY.MAX + 1,
        });
        throw new Error("Expected quantity max validation to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "quantity above max should throw ValidationError",
        );
    }

    try {
        validateUpdateCartItem({ cartItemId: 1, quantity: 1 });
        throw new Error("Expected update without owner to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "update without auth/session should throw ValidationError",
        );
    }

    try {
        validateCartItemRef({ cartItemId: 1 });
        throw new Error("Expected remove without owner to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "remove without auth/session should throw ValidationError",
        );
    }

    const merge = validateMergeGuestCart({
        userId: 1,
        sessionToken: "550e8400-e29b-41d4-a716-446655440000",
    });
    assert(merge.userId === 1, "merge userId should parse");

    assert(validateCartItemId("12") === 12, "cartItemId coerce");
    assert(validateCatalogItemId("3") === 3, "cid coerce");
    assert(validateUserId("7") === 7, "userId coerce");

    console.log("SUCCESS: cart validator checks passed");
}

function testResolveCartKind() {
    assert(
        resolveCartKind({ userId: 1, sessionToken: null }) ===
            CART_KINDS.CUSTOMER,
        "userId should resolve to customer",
    );
    assert(
        resolveCartKind({
            userId: 1,
            sessionToken: "550e8400-e29b-41d4-a716-446655440000",
        }) === CART_KINDS.CUSTOMER,
        "userId should win over session token",
    );
    assert(
        resolveCartKind({
            userId: null,
            sessionToken: "550e8400-e29b-41d4-a716-446655440000",
        }) === CART_KINDS.GUEST,
        "session-only should resolve to guest",
    );
    assert(
        resolveCartKind({ userId: null, sessionToken: null }) ===
            CART_KINDS.GUEST,
        "anonymous should resolve to guest kind",
    );

    console.log("SUCCESS: resolveCartKind checks passed");
}

async function testOptionalAuthnMiddleware() {
    const optional = authnMiddleware({ optional: true });
    const authHeader = iamService.access_management.AUTH_HEADERS.AUTHORIZATION;

    const guestReq = { headers: {} };
    await runMiddleware(optional, guestReq);
    assert(guestReq.user === null, "missing Authorization should be guest");

    const emptyReq = { headers: { [authHeader]: "" } };
    await runMiddleware(optional, emptyReq);
    assert(emptyReq.user === null, "empty Authorization should be guest");

    try {
        await runMiddleware(optional, {
            headers: { [authHeader]: "Bearer not-a-valid-jwt" },
        });
        throw new Error("Expected invalid Bearer to fail under optional auth");
    } catch (error) {
        assert(
            error instanceof UnauthorizedError,
            "invalid Bearer should throw UnauthorizedError (not become guest)",
        );
    }

    console.log("SUCCESS: optional authn missing vs invalid checks passed");
}

async function testAnonymousViewDoesNotMint() {
    const before = await getPool().then((pool) =>
        pool.execute(
            `SELECT COUNT(*) AS total FROM carts WHERE user_id IS NULL`,
        ),
    );
    const beforeCount = Number(before[0][0].total);

    const cart = await cartService.viewCart(
        { userId: null, sessionToken: null },
        { page: 1, limit: 10 },
    );

    assert(cart.cart_id === null, "anonymous view should have null cart_id");
    assert(cart.is_guest === true, "anonymous view should be guest");
    assert(cart.session_token === null, "anonymous view should not mint token");
    assert(
        Array.isArray(cart.items) && cart.items.length === 0,
        "anonymous view should return empty items",
    );

    const after = await getPool().then((pool) =>
        pool.execute(
            `SELECT COUNT(*) AS total FROM carts WHERE user_id IS NULL`,
        ),
    );
    const afterCount = Number(after[0][0].total);
    assert(
        afterCount === beforeCount,
        "anonymous GET must not create guest cart rows",
    );

    console.log("SUCCESS: anonymous GET does not mint guest carts");
}

async function testGuestAddViewUpdateRemoveClear() {
    const added = await cartService.addToCart({
        userId: null,
        sessionToken: null,
        cid: ACTIVE_CID,
        configId: null,
        quantity: 1,
    });

    assert(added.is_guest === true, "guest add should mark is_guest");
    assert(
        typeof added.session_token === "string" &&
            added.session_token.length === VALIDATIONS.SESSION_TOKEN.LENGTH,
        "guest add should mint session token",
    );
    assert(added.cid === ACTIVE_CID, "added line cid should match");
    assert(Number(added.quantity) === 1, "added quantity should be 1");

    const sessionToken = added.session_token;

    const viewed = await cartService.viewCart(
        { userId: null, sessionToken },
        { page: 1, limit: 10 },
    );
    assert(viewed.session_token === sessionToken, "view should keep session");
    assert(
        viewed.items.some((item) => item.cart_item_id === added.cart_item_id),
        "view should include added line",
    );

    const updated = await cartService.updateCartItemQuantity({
        userId: null,
        sessionToken,
        cartItemId: added.cart_item_id,
        quantity: 2,
    });
    assert(Number(updated.quantity) === 2, "update should set quantity to 2");

    const removed = await cartService.removeFromCart({
        userId: null,
        sessionToken,
        cartItemId: added.cart_item_id,
    });
    assert(
        removed.cart_item_id === added.cart_item_id,
        "remove should return cart_item_id",
    );

    const afterRemove = await cartService.viewCart(
        { userId: null, sessionToken },
        { page: 1, limit: 10 },
    );
    assert(afterRemove.items.length === 0, "cart should be empty after remove");

    // re-add then clear
    await cartService.addToCart({
        userId: null,
        sessionToken,
        cid: ACTIVE_CID,
        quantity: 1,
    });
    const cleared = await cartService.clearCart({
        userId: null,
        sessionToken,
    });
    assert(cleared.is_guest === true, "clear should keep guest meta");
    assert(
        cleared.session_token === sessionToken,
        "clear should keep session token",
    );

    const afterClear = await cartService.viewCart(
        { userId: null, sessionToken },
        { page: 1, limit: 10 },
    );
    assert(afterClear.items.length === 0, "cart should be empty after clear");

    console.log("SUCCESS: guest add/view/update/remove/clear flow passed");
}

async function testConfigMustBelongToCatalog() {
    try {
        await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: ACTIVE_CID,
            configId: OTHER_CONFIG_ID,
            quantity: 1,
        });
        throw new Error("Expected mismatched config_id to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "config belonging to another cid should throw ValidationError",
        );
        assert(
            error.message.includes("does not belong"),
            "error should mention ownership mismatch",
        );
    }

    const ok = await cartService.addToCart({
        userId: null,
        sessionToken: null,
        cid: ACTIVE_CID,
        configId: MATCHING_CONFIG_ID,
        quantity: 1,
    });
    assert(
        ok.config_id === MATCHING_CONFIG_ID,
        "matching config should be accepted",
    );

    console.log("SUCCESS: config↔cid ownership checks passed");
}

async function testClearCartRequiresOwner() {
    try {
        await cartService.clearCart({ userId: null, sessionToken: null });
        throw new Error("Expected clear without owner to fail");
    } catch (error) {
        assert(
            error instanceof ValidationError,
            "clear without owner should throw ValidationError",
        );
    }

    console.log("SUCCESS: clearCart requires auth or session");
}

async function testExpiredGuestSessionViewDoesNotRemint() {
    const added = await cartService.addToCart({
        userId: null,
        sessionToken: null,
        cid: ACTIVE_CID,
        quantity: 1,
    });
    const sessionToken = added.session_token;

    const pool = await getPool();
    await pool.execute(
        `UPDATE carts SET expires_at = DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY)
         WHERE session_token = ? AND user_id IS NULL`,
        [sessionToken],
    );

    const before = await pool.execute(
        `SELECT COUNT(*) AS total FROM carts WHERE user_id IS NULL`,
    );
    const beforeCount = Number(before[0][0].total);

    const viewed = await cartService.viewCart(
        { userId: null, sessionToken },
        { page: 1, limit: 10 },
    );

    assert(viewed.cart_id === null, "expired session view should be empty");
    assert(
        viewed.session_token === null,
        "expired session view must not remint a token",
    );
    assert(viewed.items.length === 0, "expired session view has no items");

    const after = await pool.execute(
        `SELECT COUNT(*) AS total FROM carts WHERE user_id IS NULL`,
    );
    const afterCount = Number(after[0][0].total);
    assert(
        afterCount === beforeCount - 1 || afterCount <= beforeCount,
        "expired guest cart should be deleted and not replaced on GET",
    );

    const [rows] = await pool.execute(
        `SELECT cart_id FROM carts WHERE session_token = ?`,
        [sessionToken],
    );
    assert(rows.length === 0, "expired session token row should be gone");

    console.log("SUCCESS: expired guest GET deletes and does not remint");
}

async function testMergeGuestCartIntoUser() {
    const guestAdd = await cartService.addToCart({
        userId: null,
        sessionToken: null,
        cid: ACTIVE_CID,
        configId: null,
        quantity: 1,
    });
    const sessionToken = guestAdd.session_token;

    const email = `cart-merge-${Date.now()}@example.com`;
    const password = "Password1!";
    const registered = await iamService.access_management.register({
        firstName: "Cart",
        lastName: "Merge",
        email,
        password,
    });
    const userId = registered.user_id;

    const merge = await cartService.mergeGuestCartIntoUser({
        userId,
        sessionToken,
    });
    assert(merge.merged === true, "merge should report merged");
    assert(merge.moved_items >= 1, "merge should move at least one line");

    const userCart = await cartService.viewCart(
        { userId, sessionToken: null },
        { page: 1, limit: 20 },
    );
    assert(
        userCart.items.some((item) => item.cid === ACTIVE_CID),
        "user cart should contain merged catalog item",
    );
    assert(userCart.is_guest === false, "user cart should not be guest");

    const pool = await getPool();
    const [guestRows] = await pool.execute(
        `SELECT cart_id FROM carts WHERE session_token = ? AND user_id IS NULL`,
        [sessionToken],
    );
    assert(guestRows.length === 0, "guest cart should be deleted after merge");

    const second = await cartService.mergeGuestCartIntoUser({
        userId,
        sessionToken,
    });
    assert(
        second.merged === false && second.moved_items === 0,
        "re-merge missing guest should be a no-op",
    );

    console.log("SUCCESS: guest→user merge flow passed");
}

async function testAddRejectsInactiveCatalogItem() {
    const pool = await getPool();
    const inactiveCid = 5;

    await pool.execute(
        `UPDATE catalog_items SET is_active = FALSE WHERE cid = ?`,
        [inactiveCid],
    );

    try {
        try {
            await cartService.addToCart({
                userId: null,
                sessionToken: null,
                cid: inactiveCid,
                quantity: 1,
            });
            throw new Error("Expected add of inactive catalog item to fail");
        } catch (error) {
            assert(
                error instanceof ValidationError,
                "inactive catalog item should throw ValidationError",
            );
        }
    } finally {
        await pool.execute(
            `UPDATE catalog_items SET is_active = TRUE WHERE cid = ?`,
            [inactiveCid],
        );
    }

    console.log("SUCCESS: inactive catalog item cannot be added");
}

async function testMissingCatalogItemOnAdd() {
    try {
        await cartService.addToCart({
            userId: null,
            sessionToken: null,
            cid: 9_999_999,
            quantity: 1,
        });
        throw new Error("Expected missing catalog item add to fail");
    } catch (error) {
        assert(
            error instanceof NotFoundError,
            "missing catalog item should throw NotFoundError",
        );
    }

    console.log("SUCCESS: missing catalog item add returns NotFound");
}

(async () => {
    try {
        testCartValidators();
        testResolveCartKind();
        await testOptionalAuthnMiddleware();
        await testAnonymousViewDoesNotMint();
        await testGuestAddViewUpdateRemoveClear();
        await testConfigMustBelongToCatalog();
        await testClearCartRequiresOwner();
        await testExpiredGuestSessionViewDoesNotRemint();
        await testMergeGuestCartIntoUser();
        await testAddRejectsInactiveCatalogItem();
        await testMissingCatalogItemOnAdd();
        process.exit(0);
    } catch (error) {
        console.error("FAIL:", error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        if (error.code === "ECONNREFUSED") {
            console.error(
                "Hint: npm run docker:up && npm run db:schema:apply && npm run db:seed:apply",
            );
        }
        process.exit(1);
    }
})();
