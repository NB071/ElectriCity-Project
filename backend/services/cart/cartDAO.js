import {
  ValidationError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors.js";
import BaseDAO from "../../utils/BaseDAO.js";
import crypto from "node:crypto";

/**
 * This class is used to interact with the cart database.
 * @touches_tables: carts, cart_items, catalog_items, models, brands, configurations, catalog_images, media, config_options, option_values, option_categories
 * @class
 * @extends BaseDAO
 */
class CartDAO extends BaseDAO {
  /**
   * This private method resolves a sort key to an 'ORDER BY' SQL clause.
   * @private
   * @param {string} sort
   * @returns {string}
   * @throws {ValidationError} If the sort key is not supported
   */
  #resolveSortClause(sort) {
    switch (sort) {
      case "added_at_desc":
        return "ci.added_at DESC";
      case "added_at_asc":
        return "ci.added_at ASC";
      case "price_asc":
        return "COALESCE(cfg.total_price, cat.base_price) ASC";
      case "price_desc":
        return "COALESCE(cfg.total_price, cat.base_price) DESC";
      default:
        throw new ValidationError(`Unsupported cart sort: ${sort}`);
    }
  }

  /**
   * This private method ensures a locked catalog row is active and has enough stock.
   * @private
   * @param {object|undefined} catalog
   * @param {number} requestedQuantity
   * @throws {NotFoundError|ValidationError}
   */
  #assertCatalogPurchasable(catalog, requestedQuantity) {
    if (!catalog) {
      throw new NotFoundError("Catalog item");
    }

    if (!catalog.is_active) {
      throw new ValidationError("Catalog item is not available.");
    }

    const stock = Number(catalog.quantity);
    if (requestedQuantity > stock) {
      throw new ValidationError(
        stock <= 0
          ? "Catalog item is out of stock."
          : `Only ${stock} unit(s) available in stock.`,
      );
    }
  }

  // #########################
  // Read operations
  // #########################
  /**
   * This method finds a cart by user id.
   * @param {number} user_id
   * @returns {Promise<object|null>}
   * @throws {DatabaseError} On database failures
   */
  async findCartByUserId(user_id) {
    const [rows] = await this._query(
      `SELECT cart_id, user_id, session_token, expires_at, created_at, updated_at
             FROM carts
             WHERE user_id = ?`,
      [user_id],
      { suppressNotFound: true },
    );
    return rows[0] ?? null;
  }

  /**
   * This method finds a guest cart by session token.
   * @param {string} session_token
   * @returns {Promise<object|null>}
   * @throws {DatabaseError} On database failures
   */
  async findCartBySessionToken(session_token) {
    const [rows] = await this._query(
      `SELECT cart_id, user_id, session_token, expires_at, created_at, updated_at
             FROM carts
             WHERE session_token = ? AND user_id IS NULL`,
      [session_token],
      { suppressNotFound: true },
    );
    return rows[0] ?? null;
  }

  /**
   * This method counts cart items for a cart.
   * @param {number} cart_id
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countItemsByCartId(cart_id) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total
             FROM cart_items ci
             JOIN catalog_items cat ON cat.cid = ci.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             WHERE ci.cart_id = ?`,
      [cart_id],
    );
    return Number(rows[0].total);
  }

  /**
   * This method returns paginated cart items with catalog and configuration details.
   * @param {number} cart_id
   * @param {number} limit
   * @param {number} offset
   * @param {string} sort Validated sort key from VALIDATIONS.SORT_VALUES
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findItemsByCartId(cart_id, limit, offset, sort) {
    const orderBy = this.#resolveSortClause(sort);
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    const [rows] = await this._query(
      `SELECT
                ci.cart_item_id,
                ci.cart_id,
                ci.cid,
                ci.config_id,
                ci.quantity,
                ci.added_at,
                cat.item_type,
                cat.base_price,
                cat.quantity AS stock,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at,
                pm.url AS primary_image_url
             FROM cart_items ci
             JOIN catalog_items cat ON cat.cid = ci.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = ci.config_id
             LEFT JOIN catalog_images cat_img
                ON cat_img.cid = ci.cid AND cat_img.is_primary = TRUE
             LEFT JOIN media pm ON pm.media_id = cat_img.media_id
             WHERE ci.cart_id = ?
             ORDER BY ${orderBy}
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [cart_id],
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method returns selected customization options for one or more configurations.
   * Joins config_options, option_values, and option_categories.
   * @param {number[]} config_ids
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findOptionsByConfigIds(config_ids) {
    if (!config_ids.length) {
      return [];
    }

    const placeholders = config_ids.map(() => "?").join(", ");
    const [rows] = await this._query(
      `SELECT
                co.config_id,
                co.option_id,
                ov.name AS option_name,
                ov.price_delta,
                oc.category_id,
                oc.name AS category_name,
                oc.select_type
             FROM config_options co
             JOIN option_values ov ON ov.option_id = co.option_id
             JOIN option_categories oc ON oc.category_id = ov.category_id
             WHERE co.config_id IN (${placeholders})
             ORDER BY oc.category_id ASC, ov.name ASC`,
      config_ids,
      { suppressNotFound: true },
    );
    return rows;
  }

  /**
   * This method finds one cart item by cart_id and cart_item_id.
   * @param {number} cart_id
   * @param {number} cart_item_id
   * @returns {Promise<object|null>}
   * @throws {DatabaseError} On database failures
   */
  async findItemByCartAndId(cart_id, cart_item_id) {
    const [rows] = await this._query(
      `SELECT
                ci.cart_item_id,
                ci.cart_id,
                ci.cid,
                ci.config_id,
                ci.quantity,
                ci.added_at,
                cat.item_type,
                cat.base_price,
                cat.quantity AS stock,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at,
                pm.url AS primary_image_url
             FROM cart_items ci
             JOIN catalog_items cat ON cat.cid = ci.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = ci.config_id
             LEFT JOIN catalog_images cat_img
                ON cat_img.cid = ci.cid AND cat_img.is_primary = TRUE
             LEFT JOIN media pm ON pm.media_id = cat_img.media_id
             WHERE ci.cart_id = ? AND ci.cart_item_id = ?`,
      [cart_id, cart_item_id],
      { suppressNotFound: true },
    );
    return rows[0] ?? null;
  }

  // #########################
  // Write operations
  // #########################
  /**
   * This method creates a cart for a user.
   * @param {number} user_id
   * @returns {Promise<number>} The inserted cart_id
   * @throws {ConflictError} If the user already has a cart
   * @throws {DatabaseError} On database failures
   */
  async insertCart(user_id) {
    const [result] = await this._query(
      `INSERT INTO carts (user_id) VALUES (?)`,
      [user_id],
      { conflictMessage: "User already has a cart." },
    );
    return result.insertId;
  }

  /**
   * This method returns the user's cart id, creating one if missing.
   * @param {number} user_id
   * @returns {Promise<number>} cart_id
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If cart cannot be found after a create conflict
   */
  async ensureCartForUser(user_id) {
    const existing = await this.findCartByUserId(user_id);
    if (existing) {
      return existing.cart_id;
    }

    try {
      return await this.insertCart(user_id);
    } catch (err) {
      if (!(err instanceof ConflictError)) {
        throw err;
      }

      const cart = await this.findCartByUserId(user_id);
      if (!cart) {
        throw new NotFoundError("Cart");
      }
      return cart.cart_id;
    }
  }

  /**
   * This method creates a guest cart with session token and expiry.
   * @param {string} session_token
   * @param {Date} expires_at
   * @returns {Promise<number>} cart_id
   * @throws {ConflictError} If session_token already exists
   * @throws {DatabaseError} On database failures
   */
  async insertGuestCart(session_token, expires_at) {
    const [result] = await this._query(
      `INSERT INTO carts (user_id, session_token, expires_at)
             VALUES (NULL, ?, ?)`,
      [session_token, expires_at],
      { conflictMessage: "Guest cart session already exists." },
    );
    return result.insertId;
  }

  /**
   * This method looks up a guest cart for read-only use.
   * Expired carts are deleted and treated as not found.
   * @param {string} sessionToken
   * @returns {Promise<object|null>} Cart row or null if missing/expired
   * @throws {DatabaseError} On database failures
   */
  async findActiveGuestCartBySessionToken(sessionToken) {
    const existing = await this.findCartBySessionToken(sessionToken);
    if (!existing) {
      return null;
    }

    const expired =
      existing.expires_at != null && new Date(existing.expires_at) < new Date();

    if (expired) {
      await this.deleteCartById(existing.cart_id);
      return null;
    }

    return existing;
  }

  /**
   * This method updates the expiry date of a guest cart.
   * @param {number} cart_id
   * @param {Date} expires_at
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   */
  async touchGuestCartExpiry(cart_id, expires_at) {
    await this._query(
      `UPDATE carts SET expires_at = ? WHERE cart_id = ? AND user_id IS NULL`,
      [expires_at, cart_id],
    );
  }

  /**
   * This method ensures a guest cart for the session token (mints token when missing).
   * Expired carts are deleted and replaced.
   * @param {string|null} sessionToken session token
   * @param {Date} expiresAt expiry date
   * @returns {Promise<{ cart_id: number, session_token: string, is_guest: true }>} the cart id, session token, and is_guest flag
   * @throws {DatabaseError} On database failures
   */
  async ensureCartForGuest(sessionToken, expiresAt) {
    if (sessionToken) {
      const existing = await this.findCartBySessionToken(sessionToken);
      if (existing) {
        const expired =
          existing.expires_at != null &&
          new Date(existing.expires_at) < new Date();

        if (!expired) {
          await this.touchGuestCartExpiry(existing.cart_id, expiresAt);
          return {
            cart_id: existing.cart_id,
            session_token: existing.session_token,
            is_guest: true,
          };
        }

        await this.deleteCartById(existing.cart_id);
      }
    }

    const token = crypto.randomUUID({ disableEntropyCache: true });

    try {
      const cart_id = await this.insertGuestCart(token, expiresAt);
      return { cart_id, session_token: token, is_guest: true };
    } catch (err) {
      if (!(err instanceof ConflictError)) {
        throw err;
      }
      const cart = await this.findCartBySessionToken(token);
      if (!cart) {
        throw new NotFoundError("Cart");
      }
      return {
        cart_id: cart.cart_id,
        session_token: cart.session_token,
        is_guest: true,
      };
    }
  }

  /**
   * Deletes a cart row (items cascade).
   * @param {number} cart_id
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   */
  async deleteCartById(cart_id) {
    await this._query(`DELETE FROM carts WHERE cart_id = ?`, [cart_id]);
  }

  /**
   * This method inserts a cart line or increments quantity, checking stock under row locks
   * so concurrent adds cannot exceed catalog stock or maxQuantity.
   * @param {object} input data to insert or update
   * @param {number} input.cart_id cart id
   * @param {number} input.cid catalog item id
   * @param {number|null} [input.config_id] configuration id
   * @param {number} input.quantity Amount to add
   * @param {number} input.maxQuantity maximum quantity allowed
   * @returns {Promise<number>} the cart_item_id
   * @throws {ValidationError} If inactive, over stock, or over max quantity
   * @throws {DatabaseError} On database failures
   */
  async upsertCartItemIncrement({
    cart_id,
    cid,
    config_id = null,
    quantity,
    maxQuantity,
  }) {
    return this._transaction(async (conn) => {
      // lock the cart row
      await conn.execute(
        `SELECT cart_id FROM carts WHERE cart_id = ? FOR UPDATE`,
        [cart_id],
      );

      // find the existing cart item and lock it
      const [existingRows] =
        config_id == null
          ? await conn.execute(
              `SELECT cart_item_id, quantity FROM cart_items
                           WHERE cart_id = ? AND cid = ? AND config_id IS NULL
                           FOR UPDATE`,
              [cart_id, cid],
            )
          : await conn.execute(
              `SELECT cart_item_id, quantity FROM cart_items
                           WHERE cart_id = ? AND cid = ? AND config_id = ?
                           FOR UPDATE`,
              [cart_id, cid, config_id],
            );

      // calculate the new quantity
      const existingQty = Number(existingRows[0]?.quantity ?? 0);
      const delta = Number(quantity);
      const newQuantity = existingQty + delta;

      // if the new quantity is greater than the maximum quantity, throw an error
      if (newQuantity > maxQuantity) {
        throw new ValidationError(`quantity must be at most ${maxQuantity}.`);
      }

      // check the catalog stock and availability
      const [catalogRows] = await conn.execute(
        `SELECT quantity, is_active FROM catalog_items WHERE cid = ? FOR UPDATE`,
        [cid],
      );
      this.#assertCatalogPurchasable(catalogRows[0], newQuantity);

      // insert the cart item
      const [result] = await conn.execute(
        `INSERT INTO cart_items (cart_id, cid, config_id, quantity)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                   quantity = quantity + VALUES(quantity),
                   cart_item_id = LAST_INSERT_ID(cart_item_id)`,
        [cart_id, cid, config_id, delta],
      );
      return result.insertId;
    });
  }

  /**
   * This method updates a cart item quantity.
   * @param {number} cart_item_id
   * @param {number} quantity
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the cart item is not found
   * @throws {ValidationError} If inactive or over stock
   * @throws {DatabaseError} On database failures
   */
  async updateItemQuantity(cart_id, cart_item_id, quantity) {
    return this._transaction(async (conn) => {
      // find the cart item and lock it
      const [itemRows] = await conn.execute(
        `SELECT cart_item_id, cid, quantity
                 FROM cart_items
                 WHERE cart_id = ? AND cart_item_id = ?
                 FOR UPDATE`,
        [cart_id, cart_item_id],
      );

      const item = itemRows[0];
      if (!item) {
        throw new NotFoundError("Cart item");
      }

      // check the catalog stock and availability
      const [catalogRows] = await conn.execute(
        `SELECT quantity, is_active FROM catalog_items WHERE cid = ? FOR UPDATE`,
        [item.cid],
      );
      this.#assertCatalogPurchasable(catalogRows[0], Number(quantity));

      // update the cart item quantity
      await conn.execute(
        `UPDATE cart_items SET quantity = ? WHERE cart_item_id = ? AND cart_id = ?`,
        [quantity, cart_item_id, cart_id],
      );
    });
  }

  /**
   * This method removes one cart item by id.
   * @param {number} cart_item_id
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the cart item is not found
   */
  async deleteItemById(cart_item_id) {
    await this._query(
      `DELETE FROM cart_items WHERE cart_item_id = ?`,
      [cart_item_id],
      { notFoundResource: "Cart item" },
    );
  }

  /**
   * This method removes all items from a cart.
   * @param {number} cart_id
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   */
  async deleteAllItemsByCartId(cart_id) {
    await this._query(`DELETE FROM cart_items WHERE cart_id = ?`, [cart_id]);
  }

  /**
   * Thos method atomically merges a guest cart into the user's cart, then deletes the guest cart.
   * It locks the guest (and user) cart row so concurrent merges cannot double-apply.
   * @param {object} input data to merge the guest cart into the user's cart
   * @param {number} input.userId user id
   * @param {string} input.sessionToken session token
   * @param {number} input.maxQuantity maximum quantity allowed
   * @param {(line: { cid: number, configId: number|null, newQuantity: number }) => Promise<void>} input.validateLine function to validate the line
   * @returns {Promise<{ merged: boolean, moved_items: number }>} the merged flag and the number of moved items
   * @throws {ValidationError} If a line would exceed max quantity or validateLine fails
   * @throws {DatabaseError} On database failures
   */
  async mergeGuestCartIntoUser({
    userId,
    sessionToken,
    maxQuantity,
    validateLine,
  }) {
    return this._transaction(async (conn) => {
      // find the guest cart
      const [guestRows] = await conn.execute(
        `SELECT cart_id, user_id, session_token, expires_at
                 FROM carts
                 WHERE session_token = ? AND user_id IS NULL
                 FOR UPDATE`,
        [sessionToken],
      );
      const guest = guestRows[0];

      // if the guest cart is not found, return false and 0 moved items
      if (!guest) {
        return { merged: false, moved_items: 0 };
      }

      // if the guest cart is expired, delete it and return false and 0 moved items
      if (guest.expires_at != null && new Date(guest.expires_at) < new Date()) {
        await conn.execute(`DELETE FROM carts WHERE cart_id = ?`, [
          guest.cart_id,
        ]);
        return { merged: false, moved_items: 0 };
      }

      // find the user's cart
      const [userRows] = await conn.execute(
        `SELECT cart_id FROM carts WHERE user_id = ? FOR UPDATE`,
        [userId],
      );
      let userCartId = userRows[0]?.cart_id ?? null;

      // if the user's cart is not found, create it
      if (userCartId == null) {
        try {
          // create the user's cart
          const [inserted] = await conn.execute(
            `INSERT INTO carts (user_id) VALUES (?)`,
            [userId],
          );
          userCartId = inserted.insertId;
        } catch (err) {
          if (err.code !== "ER_DUP_ENTRY") {
            throw err;
          }
          // find the user's cart again
          const [retryRows] = await conn.execute(
            `SELECT cart_id FROM carts WHERE user_id = ? FOR UPDATE`,
            [userId],
          );
          userCartId = retryRows[0]?.cart_id ?? null;

          // if the user's cart is not found, throw an error
          if (userCartId == null) {
            throw new NotFoundError("Cart");
          }
        }
      }

      // if the guest cart is the same as the user's cart, return false and 0 moved items
      if (guest.cart_id === userCartId) {
        return { merged: false, moved_items: 0 };
      }

      // find the guest items
      const [guestItems] = await conn.execute(
        `SELECT cart_item_id, cart_id, cid, config_id, quantity, added_at
                 FROM cart_items
                 WHERE cart_id = ?
                 ORDER BY added_at ASC`,
        [guest.cart_id],
      );

      // merge the guest items into the user's cart
      let moved = 0;
      for (const line of guestItems) {
        const configId = line.config_id ?? null;
        const qty = Number(line.quantity);

        // find the existing cart item and calculate the new quantity
        const [existingRows] =
          configId == null
            ? await conn.execute(
                `SELECT cart_item_id, quantity FROM cart_items
                               WHERE cart_id = ? AND cid = ? AND config_id IS NULL`,
                [userCartId, line.cid],
              )
            : await conn.execute(
                `SELECT cart_item_id, quantity FROM cart_items
                               WHERE cart_id = ? AND cid = ? AND config_id = ?`,
                [userCartId, line.cid, configId],
              );
        const existing = existingRows[0];
        const newQuantity = (existing?.quantity ?? 0) + qty;

        // if the new quantity is greater than the maximum quantity, throw an error
        if (newQuantity > maxQuantity) {
          throw new ValidationError(
            `Cannot merge cart: quantity for cid ${line.cid} would exceed ${maxQuantity}.`,
          );
        }

        // check the catalog stock and availability
        const [catalogRows] = await conn.execute(
          `SELECT quantity, is_active FROM catalog_items WHERE cid = ? FOR UPDATE`,
          [line.cid],
        );
        this.#assertCatalogPurchasable(catalogRows[0], newQuantity);

        // validate the line
        await validateLine({
          cid: line.cid,
          configId,
          newQuantity,
        });

        // upsert the cart item
        await conn.execute(
          `INSERT INTO cart_items (cart_id, cid, config_id, quantity)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                       quantity = quantity + VALUES(quantity),
                       cart_item_id = LAST_INSERT_ID(cart_item_id)`,
          [userCartId, line.cid, configId, qty],
        );
        moved += 1;
      }

      // delete the guest cart
      await conn.execute(`DELETE FROM carts WHERE cart_id = ?`, [
        guest.cart_id,
      ]);

      // return the merged flag and the number of moved items
      return { merged: moved > 0, moved_items: moved };
    });
  }
}

const cartDAO = new CartDAO();
export default cartDAO;
