import BaseDAO from "../../utils/BaseDAO.js";
import { NotFoundError, ValidationError } from "../../utils/errors.js";
import { VALIDATIONS } from "./constants.js";
import { computeOrderTotals } from "./helpers/orderTotals.js";

const USER_JOIN = `LEFT JOIN users u ON u.user_id = o.user_id`;

/**
 * This class is used to interact with the database.
 * @touches_tables: orders, order_items, users, catalog_items, models, brands, configurations, order_addresses, carts, cart_items
 * @class
 * @extends BaseDAO
 */
class OrderDAO extends BaseDAO {
  // #########################
  // Read operations
  // #########################

  /**
   * This method checks whether an order exists.
   * @param {number} order_id
   * @returns {Promise<boolean>}
   * @throws {DatabaseError} On database failures
   */
  async existsById(order_id) {
    const [rows] = await this._query(
      `SELECT 1 FROM orders WHERE order_id = ? LIMIT 1`,
      [order_id],
      { suppressNotFound: true },
    );

    return rows.length > 0;
  }

  /**
   * This method finds an order by its order ID.
   * @param {number} order_id
   * @returns {Promise<object>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the order is not found
   */
  async findById(order_id) {
    const [rows] = await this._query(
      `SELECT
                order_id,
                user_id,
                guest_email,
                order_status,
                payment_status,
                subtotal,
                tax,
                total,
                additional_information,
                created_at,
                updated_at
             FROM orders
             WHERE order_id = ?`,
      [order_id],
      { notFoundResource: "Order" },
    );

    return rows[0];
  }

  /**
   * This method counts orders for a user.
   * @param {number} user_id
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countOrdersByUserId(user_id) {
    const [rows] = await this._query(
      `SELECT COUNT(*) AS total FROM orders WHERE user_id = ?`,
      [user_id],
    );

    return Number(rows[0].total);
  }

  /**
   * This method returns paginated orders for a user, most recent first.
   * @param {number} user_id
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findOrdersByUserId(user_id, limit, offset) {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    const [rows] = await this._query(
      `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.additional_information,
                o.created_at,
                o.updated_at,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count
             FROM orders o
             WHERE o.user_id = ?
             ORDER BY o.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [user_id],
      { suppressNotFound: true },
    );

    return rows;
  }

  /**
   * This method counts all orders across every user.
   * @returns {Promise<number>}
   * @throws {DatabaseError} On database failures
   */
  async countAllOrders() {
    const [rows] = await this._query(`SELECT COUNT(*) AS total FROM orders`);

    return Number(rows[0].total);
  }

  /**
   * This method returns paginated orders across all users (admin view).
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findAllOrders(limit, offset) {
    const safeLimit = Number(limit);
    const safeOffset = Number(offset);

    const [rows] = await this._query(
      `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.additional_information,
                o.created_at,
                o.updated_at,
                (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) AS item_count,
                u.first_name,
                u.last_name,
                u.email
             FROM orders o
             ${USER_JOIN}
             ORDER BY o.created_at DESC
             LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [],
      { suppressNotFound: true },
    );

    return rows;
  }

  /**
   * This method finds one order with author fields for admin views.
   * @param {number} order_id
   * @returns {Promise<object>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the order is not found
   */
  async findByIdWithUser(order_id) {
    const [rows] = await this._query(
      `SELECT
                o.order_id,
                o.user_id,
                o.guest_email,
                o.order_status,
                o.payment_status,
                o.subtotal,
                o.tax,
                o.total,
                o.additional_information,
                o.created_at,
                o.updated_at,
                u.first_name,
                u.last_name,
                u.email
             FROM orders o
             ${USER_JOIN}
             WHERE o.order_id = ?`,
      [order_id],
      { notFoundResource: "Order" },
    );

    return rows[0];
  }

  /**
   * This method returns the line items for an order with catalog and configuration details.
   * @param {number} order_id
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findItemsByOrderId(order_id) {
    const [rows] = await this._query(
      `SELECT
                oi.order_item_id,
                oi.order_id,
                oi.cid,
                oi.config_id,
                oi.quantity,
                oi.unit_price,
                cat.item_type,
                cat.base_price,
                cat.is_active,
                b.name AS brand_name,
                m.name AS model_name,
                cfg.total_price AS config_total_price,
                cfg.created_at AS config_created_at
             FROM order_items oi
             JOIN catalog_items cat ON cat.cid = oi.cid
             JOIN models m ON m.model_id = cat.model_id
             JOIN brands b ON b.brand_id = m.brand_id
             LEFT JOIN configurations cfg ON cfg.config_id = oi.config_id
             WHERE oi.order_id = ?
             ORDER BY oi.order_item_id ASC`,
      [order_id],
      { suppressNotFound: true },
    );

    return rows;
  }

  /**
   * This method returns the addresses recorded for an order.
   * @param {number} order_id
   * @returns {Promise<object[]>}
   * @throws {DatabaseError} On database failures
   */
  async findAddressesByOrderId(order_id) {
    const [rows] = await this._query(
      `SELECT
                order_address_id,
                order_id,
                address_type,
                full_name,
                phone_number,
                street,
                city,
                province,
                country,
                postal_code,
                created_at
             FROM order_addresses
             WHERE order_id = ?`,
      [order_id],
      { suppressNotFound: true },
    );

    return rows;
  }

  // #########################
  // Write operations
  // #########################

  /**
   * This method updates the payment_status on an order.
   * @param {number} order_id
   * @param {string} payment_status
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the order is not found
   */
  async updatePaymentStatus(order_id, payment_status) {
    await this._query(
      `UPDATE orders SET payment_status = ? WHERE order_id = ?`,
      [payment_status, order_id],
      { notFoundResource: "Order" },
    );
  }

  /**
   * This method updates the order_status on an order.
   * @param {number} order_id
   * @param {string} order_status
   * @returns {Promise<void>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the order is not found
   */
  async updateOrderStatus(order_id, order_status) {
    await this._query(
      `UPDATE orders SET order_status = ? WHERE order_id = ?`,
      [order_status, order_id],
      { notFoundResource: "Order" },
    );
  }

  /**
   * This method cancels an order and optionally restores catalog stock in one transaction.
   * @param {number} order_id
   * @param {boolean} restoreStock
   * @returns {Promise<void>}
   * @throws {NotFoundError} If the order is not found
   * @throws {DatabaseError} On database failures
   */
  async cancelOrderWithStockRestore(order_id, restoreStock) {
    return this._transaction(async (conn) => {
      // find the order by the order id
      const [orderRows] = await conn.execute(
        `SELECT order_id, order_status, payment_status
                 FROM orders
                 WHERE order_id = ?
                 FOR UPDATE`,
        [order_id],
      );
      const order = orderRows[0];
      if (!order) {
        throw new NotFoundError("Order");
      }

      // if the order status is cancelled, return
      if (order.order_status === VALIDATIONS.ORDER_STATUS.CANCELLED) {
        return;
      }

      // if the restore stock is true, restore the stock for the items
      if (restoreStock) {
        const [items] = await conn.execute(
          `SELECT cid, quantity FROM order_items WHERE order_id = ?`,
          [order_id],
        );

        // create a map of the quantities by cid
        const qtyByCid = new Map();
        for (const item of items) {
          const cid = Number(item.cid);
          qtyByCid.set(cid, (qtyByCid.get(cid) ?? 0) + Number(item.quantity));
        }

        // restore the stock for the items
        for (const [cid, qty] of qtyByCid) {
          await conn.execute(
            `UPDATE catalog_items
                         SET quantity = quantity + ?
                         WHERE cid = ?`,
            [qty, cid],
          );
        }
      }

      // update the order status
      await conn.execute(
        `UPDATE orders SET order_status = ? WHERE order_id = ?`,
        [VALIDATIONS.ORDER_STATUS.CANCELLED, order_id],
      );
    });
  }

  /**
   * This method creates an order with stock checks/decrements under row locks.
   * @param {object} input Input object
   * @param {object} input.order { user_id, guest_email, additional_information } Order object
   * @param {object[]} input.addresses Addresses array
   * @param {number|null} [input.cartId] Cart ID
   * @param {object[]} [input.items] Items array required when cartId is null [{ cid, config_id, quantity }]
   * @param {number} input.taxRate Tax rate
   * @returns {Promise<{ order_id: number, subtotal: number, tax: number, total: number, resolvedItems: object[], cartId: number|null, clearedCartLines: object[]|null }>}
   * @throws {DatabaseError} On database failures
   * @throws {NotFoundError} If the cart is not found
   * @throws {ValidationError} If validation fails
   */
  async createOrderWithItems({
    order,
    addresses,
    cartId = null,
    items = null,
    taxRate,
  }) {
    return this._transaction(async (conn) => {
      let lines;
      let clearedCartLines = null;

      // if the cart id is not null, load and lock the cart rows and cart lines
      if (cartId != null) {
        const [cartRows] = await conn.execute(
          `SELECT cart_id FROM carts WHERE cart_id = ? FOR UPDATE`,
          [cartId],
        );
        if (!cartRows[0]) {
          throw new NotFoundError("Cart");
        }

        // load and lock the cart lines
        const [cartLines] = await conn.execute(
          `SELECT cid, config_id, quantity
                     FROM cart_items
                     WHERE cart_id = ?
                     ORDER BY added_at ASC, cart_item_id ASC`,
          [cartId],
        );
        if (cartLines.length === 0) {
          throw new ValidationError("Your cart is empty.");
        }

        // map the cart lines to the lines array
        lines = cartLines.map((row) => ({
          cid: Number(row.cid),
          config_id: row.config_id == null ? null : Number(row.config_id),
          quantity: Number(row.quantity),
        }));
        clearedCartLines = lines.map((line) => ({ ...line }));
      } else {
        if (!items?.length) {
          throw new ValidationError(
            "items must contain at least one line item.",
          );
        }
        // map the items to the lines array
        lines = items.map((item) => ({
          cid: Number(item.cid),
          config_id: item.config_id == null ? null : Number(item.config_id),
          quantity: Number(item.quantity),
        }));
      }

      // create a map of the quantities by cid
      const qtyByCid = new Map();
      for (const line of lines) {
        qtyByCid.set(line.cid, (qtyByCid.get(line.cid) ?? 0) + line.quantity);
      }

      // create a map of the catalog items by cid
      const catalogByCid = new Map();
      for (const cid of qtyByCid.keys()) {
        // load and lock the catalog item
        const [rows] = await conn.execute(
          `SELECT cid, base_price, quantity, is_active
                     FROM catalog_items
                     WHERE cid = ?
                     FOR UPDATE`,
          [cid],
        );

        const catalog = rows[0];
        if (!catalog) {
          throw new NotFoundError("Catalog item");
        }

        if (!catalog.is_active) {
          throw new ValidationError(`Catalog item ${cid} is not available.`);
        }

        // check if the needed quantity is greater than the available quantity
        const needed = qtyByCid.get(cid);
        if (needed > Number(catalog.quantity)) {
          throw new ValidationError(
            `Insufficient stock for catalog item ${cid}. Requested ${needed}, available ${catalog.quantity}.`,
          );
        }
        catalogByCid.set(cid, catalog);
      }

      // create the resolved items array (order items)
      const resolvedItems = [];
      for (const line of lines) {
        let unit_price;
        if (line.config_id == null) {
          unit_price = Number(catalogByCid.get(line.cid).base_price);
        } else {
          const [cfgRows] = await conn.execute(
            `SELECT config_id, cid, total_price
                         FROM configurations
                         WHERE config_id = ?`,
            [line.config_id],
          );
          const configuration = cfgRows[0];
          if (!configuration) {
            throw new NotFoundError("Configuration");
          }
          if (Number(configuration.cid) !== line.cid) {
            throw new ValidationError(
              `config_id ${line.config_id} does not belong to cid ${line.cid}.`,
            );
          }
          unit_price = Number(configuration.total_price);
        }

        // add the resolved item to the resolved items array
        resolvedItems.push({
          cid: line.cid,
          config_id: line.config_id,
          quantity: line.quantity,
          unit_price,
        });
      }

      // update the catalog item quantities
      for (const [cid, totalQty] of qtyByCid) {
        await conn.execute(
          `UPDATE catalog_items
                     SET quantity = quantity - ?
                     WHERE cid = ?`,
          [totalQty, cid],
        );
      }

      // compute the order totals
      const { subtotal, tax, total } = computeOrderTotals(
        resolvedItems,
        taxRate,
      );

      // insert the order
      const [orderResult] = await conn.execute(
        `INSERT INTO orders
                    (user_id, guest_email, payment_status, subtotal, tax, total, additional_information)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.user_id ?? null,
          order.guest_email ?? null,
          VALIDATIONS.PAYMENT_STATUS.UNPAID,
          subtotal,
          tax,
          total,
          order.additional_information ?? null,
        ],
      );

      // get the order id
      const order_id = orderResult.insertId;

      // insert the order items
      for (const item of resolvedItems) {
        await conn.execute(
          `INSERT INTO order_items (order_id, cid, config_id, quantity, unit_price)
                     VALUES (?, ?, ?, ?, ?)`,
          [
            order_id,
            item.cid,
            item.config_id ?? null,
            item.quantity,
            item.unit_price,
          ],
        );
      }

      // insert the order addresses
      for (const address of addresses) {
        await conn.execute(
          `INSERT INTO order_addresses
                        (order_id, address_type, full_name, phone_number, street, city, province, country, postal_code)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order_id,
            address.address_type,
            address.full_name,
            address.phone_number ?? null,
            address.street,
            address.city,
            address.province,
            address.country,
            address.postal_code,
          ],
        );
      }

      // delete the cart items if the cart id is not null
      if (cartId != null) {
        await conn.execute(`DELETE FROM cart_items WHERE cart_id = ?`, [
          cartId,
        ]);
      }

      // return the created order
      return {
        order_id,
        subtotal,
        tax,
        total,
        resolvedItems,
        cartId: cartId ?? null,
        clearedCartLines,
      };
    });
  }

  /**
   * This method restores catalog stock after a failed checkout.
   * @param {object[]} items [{ cid, quantity }]
   * @returns {Promise<void>}
   */
  async restoreStockForItems(items) {
    if (!items?.length) {
      return;
    }

    // create a map of the quantities by cid
    const qtyByCid = new Map();
    for (const item of items) {
      const cid = Number(item.cid);
      qtyByCid.set(cid, (qtyByCid.get(cid) ?? 0) + Number(item.quantity));
    }

    // restore the stock for the items
    return this._transaction(async (conn) => {
      // update the catalog item quantities
      for (const [cid, qty] of qtyByCid) {
        await conn.execute(
          `UPDATE catalog_items
                     SET quantity = quantity + ?
                     WHERE cid = ?`,
          [qty, cid],
        );
      }
    });
  }

  /**
   * This method re-inserts cart lines cleared during checkout when payment fails.
   * @param {number} cartId
   * @param {object[]} lines [{ cid, config_id, quantity }]
   * @returns {Promise<void>}
   */
  async restoreCartItems(cartId, lines) {
    if (!lines?.length) {
      return;
    }

    // re-insert the cart lines
    return this._transaction(async (conn) => {
      // re-insert the cart lines
      for (const line of lines) {
        await conn.execute(
          `INSERT INTO cart_items (cart_id, cid, config_id, quantity)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                       quantity = VALUES(quantity)`,
          [cartId, line.cid, line.config_id ?? null, line.quantity],
        );
      }
    });
  }
}

const orderDAO = new OrderDAO();
export default orderDAO;
