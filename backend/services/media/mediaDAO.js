import BaseDAO from "../../utils/BaseDAO.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

/**
 * This class is used to interact with the media database.
 */
class MediaDAO extends BaseDAO {
    // #########################
    // Read operations
    // #########################
    /**
     * This method finds a media record by its media ID.
     * @param {number} media_id
     * @returns {Promise<object>} The found media record
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the media record is not found
     */
    async findById(media_id) {
        const [rows] = await this._query(
            `SELECT media_id, url, file_type, alt_text, uploaded_at
             FROM media
             WHERE media_id = ?`,
            [media_id],
            { notFoundResource: "Media record" },
        );
        return rows[0];
    }

    /**
     * This method finds all media records linked to a catalog item.
     * @param {number} cid
     * @returns {Promise<object[]>} The found media records linked to the catalog item
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the catalog item does not exist
     */
    async findByCid(cid) {
        const [rows] = await this._query(
            `SELECT m.media_id, m.url, m.file_type, m.alt_text,
                    ci.display_order, ci.is_primary
             FROM catalog_images ci
             JOIN media m ON m.media_id = ci.media_id
             WHERE ci.cid = ?
             ORDER BY ci.display_order ASC`,
            [cid],
            { notFoundResource: "Media records linked to catalog item" },
        );
        return rows;
    }

    /**
     * This method finds the primary media record linked to a catalog item.
     * @param {number} cid
     * @returns {Promise<object>} The found primary media record
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the catalog item does not exist
     */
    async findPrimaryByCid(cid) {
        const [rows] = await this._query(
            `SELECT m.media_id, m.url, m.file_type, m.alt_text
             FROM catalog_images ci
             JOIN media m ON m.media_id = ci.media_id
             WHERE ci.cid = ? AND ci.is_primary = TRUE
             LIMIT 1`,
            [cid],
            { notFoundResource: "Primary media record linked to catalog item" },
        );
        return rows[0];
    }

    /**
     * This method finds all media records linked to a catalog item by its file_type.
     * A catalog item's images are rarely all the same MIME type as every allowed image
     * type checked by the image strategy, so an empty result here is expected, not an error.
     * @param {number} cid
     * @param {string} file_type
     * @returns {Promise<object[]>} The found media records linked to the catalog item by its file_type
     * @throws {DatabaseError} On database failures
     */
    async findByCidAndType(cid, file_type) {
        const [rows] = await this._query(
            `SELECT m.media_id, m.url, m.file_type, m.alt_text,
                    ci.display_order, ci.is_primary
             FROM catalog_images ci
             JOIN media m ON m.media_id = ci.media_id
             WHERE ci.cid = ? AND m.file_type = ?
             ORDER BY ci.display_order ASC`,
            [cid, file_type],
            { suppressNotFound: true },
        );
        return rows;
    }
    // #########################
    // Write operations
    // #########################
    /**
     * This method inserts a new media record into the database.
     * @param {object} input
     * @param {string} input.url The URL of the media record to be inserted into the database
     * @param {string} input.file_type The file type of the media record to be inserted into the database
     * @param {string} input.alt_text The alt text of the media record to be inserted into the database
     * @returns {Promise<number>} The inserted media record's ID
     * @throws {DatabaseError} On database failures
     * @throws {ConflictError} If the media record already exists
     */
    async insertMedia({ url, file_type = null, alt_text = null }) {
        const [result] = await this._query(
            `INSERT INTO media (url, file_type, alt_text) VALUES (?, ?, ?)`,
            [url, file_type, alt_text],
            { conflictMessage: "Media record already exists" },
        );
        return result.insertId;
    }

    /**
     * This method links a media record to a catalog item.
     * @param {object} linkData
     * @param {number} linkData.cid Primary key of the catalog item to link the media record to
     * @param {number} linkData.media_id Primary key of the media record to link to the catalog item
     * @param {number} linkData.display_order (optional, defaults to 0) The display order of the media record in the catalog item
     * @param {boolean} linkData.is_primary (optional, defaults to false) Whether the media record is the primary media record for the catalog item
     * @returns {Promise<void>} The media record is linked to the catalog item
     * @throws {DatabaseError} On database failures
     * @throws {ConflictError} If the media record is already linked to the catalog item
     */
    async linkToCatalogItem({
        cid,
        media_id,
        display_order = 0,
        is_primary = false,
    }) {
        await this._query(
            `INSERT INTO catalog_images (cid, media_id, display_order, is_primary)
           VALUES (?, ?, ?, ?)`,
            [cid, media_id, display_order, is_primary ? 1 : 0],
            { conflictMessage: "Media record already linked to catalog item" },
        );
    }

    /**
     * This method unlinks a media record from a catalog item.
     * @param {number} cid Primary key of the catalog item to unlink the media record from
     * @param {number} media_id Primary key of the media record to unlink from the catalog item
     * @returns {Promise<void>} The media record is successfully unlinked from the catalog item
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the media record is not linked to the catalog item
     */
    async unlinkFromCatalogItem(cid, media_id) {
        await this._query(
            `DELETE FROM catalog_images WHERE cid = ? AND media_id = ?`,
            [cid, media_id],
            { notFoundResource: "Media record" },
        );
    }

    /**
     * This method sets a media record as the primary media record for a catalog item.
     * @param {number} cid Primary key of the catalog item to set the primary catalog image for
     * @param {number} media_id Primary key of the media record to set as the primary media record for the catalog item
     * @returns {Promise<void>} The media record is successfully set as the primary media record for the catalog item
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the media record is not linked to the catalog item
     * @throws {ConflictError} If the media record is already the primary media record for the catalog item
     */
    async setPrimaryCatalogImage(cid, media_id) {
        // conn is passed from the transaction method in BaseDAO
        await this._transaction(async (conn) => {
            await conn.execute(
                `UPDATE catalog_images SET is_primary = FALSE WHERE cid = ?`,
                [cid],
            );

            try {
                const [result] = await conn.execute(
                    `UPDATE catalog_images SET is_primary = TRUE
                     WHERE cid = ? AND media_id = ?`,
                    [cid, media_id],
                );

                if (result.affectedRows === 0) {
                    throw new NotFoundError(
                        `No catalog image found for cid=${cid}, media_id=${media_id}`,
                    );
                }
            } catch (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    throw new ConflictError(
                        "Another image is already marked primary for this catalog item.",
                        { cid, media_id },
                    );
                }
                throw err;
            }
        });
    }

    /**
     * This method deletes a media record from the database.
     * @param {number} media_id Primary key of the media record to delete
     * @returns {Promise<void>} The media record is successfully deleted from the database
     * @throws {DatabaseError} On database failures
     * @throws {NotFoundError} If the media record is not found
     */
    async deleteMediaById(media_id) {
        await this._query(`DELETE FROM media WHERE media_id = ?`, [media_id], {
            notFoundResource: "Media record",
        });
    }
}

const mediaDAO = new MediaDAO();
export default mediaDAO;
