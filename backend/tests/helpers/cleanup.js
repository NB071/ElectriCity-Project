/**
 * Shared DB delete helpers for TC_*.test.js.
 */

import getPool from "../../configs/db.js";
import accountDAO from "../../services/iam/_identity/accountDAO.js";
import cartService from "../../services/cart/cart.service.js";

/** Delete an order and its payment attempts. */
export async function deleteOrder(orderId) {
    if (orderId == null) return;
    const pool = await getPool();
    await pool.execute(`DELETE FROM payment_attempts WHERE order_id = ?`, [
        orderId,
    ]);
    await pool.execute(`DELETE FROM orders WHERE order_id = ?`, [orderId]);
}

/** Delete all orders for a user. */
export async function deleteOrdersForUser(userId) {
    if (userId == null) return;
    const pool = await getPool();
    const [rows] = await pool.execute(
        `SELECT order_id FROM orders WHERE user_id = ?`,
        [userId],
    );
    for (const row of rows) {
        await deleteOrder(row.order_id);
    }
}

/**
 * Remove a test user and related rows (orders first, then carts/wishlist/etc.).
 */
export async function cleanupUser(userId) {
    if (userId == null) return;
    const pool = await getPool();

    await deleteOrdersForUser(userId);

    await pool.execute(`DELETE FROM wishlist WHERE user_id = ?`, [userId]);
    await pool.execute(`DELETE FROM addresses WHERE user_id = ?`, [userId]);
    await pool.execute(`DELETE FROM reviews WHERE user_id = ?`, [userId]);
    await pool.execute(`DELETE FROM carts WHERE user_id = ?`, [userId]);

    const [orphanAttempts] = await pool.execute(
        `SELECT attempt_id FROM payment_attempts pa
         LEFT JOIN orders o ON o.order_id = pa.order_id
         WHERE pa.user_id = ? AND o.order_id IS NULL`,
        [userId],
    );
    for (const row of orphanAttempts) {
        await pool.execute(
            `DELETE FROM payment_attempts WHERE attempt_id = ?`,
            [row.attempt_id],
        );
    }

    try {
        await accountDAO.softDeleteById(userId);
    } catch {
        // already gone
    }
}

export async function deleteReview(reviewId) {
    if (reviewId == null) return;
    const pool = await getPool();
    await pool.execute(`DELETE FROM reviews WHERE review_id = ?`, [reviewId]);
}

export async function deleteMedia(mediaId, cid = null) {
    if (mediaId == null) return;
    const pool = await getPool();
    if (cid != null) {
        await pool.execute(
            `DELETE FROM catalog_images WHERE media_id = ? AND cid = ?`,
            [mediaId, cid],
        );
    } else {
        await pool.execute(`DELETE FROM catalog_images WHERE media_id = ?`, [
            mediaId,
        ]);
    }
    await pool.execute(`DELETE FROM media WHERE media_id = ?`, [mediaId]);
}

export async function deleteGuestCart(sessionToken) {
    if (!sessionToken) return;
    try {
        await cartService.clearCart({ userId: null, sessionToken });
    } catch {
        // ignore
    }
    const pool = await getPool();
    await pool.execute(
        `DELETE FROM carts WHERE session_token = ? AND user_id IS NULL`,
        [sessionToken],
    );
}

export async function deleteConfiguration(configId) {
    if (configId == null) return;
    const pool = await getPool();
    await pool.execute(
        `UPDATE cart_items SET config_id = NULL WHERE config_id = ?`,
        [configId],
    );
    await pool.execute(
        `UPDATE order_items SET config_id = NULL WHERE config_id = ?`,
        [configId],
    );
    await pool.execute(`DELETE FROM config_options WHERE config_id = ?`, [
        configId,
    ]);
    await pool.execute(`DELETE FROM configurations WHERE config_id = ?`, [
        configId,
    ]);
}

export async function deleteEventLogsByMetaSource(source) {
    if (!source) return;
    const pool = await getPool();
    await pool.execute(
        `DELETE FROM event_logs
         WHERE JSON_UNQUOTE(JSON_EXTRACT(meta, '$.source')) = ?`,
        [source],
    );
}
