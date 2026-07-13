// Catalog Compare Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import {
    NotFoundError,
    ValidationError,
    InternalError,
} from "../../../../utils/errors.js";

class CatalogCompareHandler {
    constructor({ productDAO, compareMatrixAssembler }) {
        this.productDAO = productDAO;
        this.assembler = compareMatrixAssembler;
    }

    async compare(cids) {
        if (!Array.isArray(cids) || cids.length < 2) {
            throw new ValidationError("Compare requires at least two items");
        }

        const items = await this._fetchItems(cids);

        if (items.length !== cids.length) {
            throw new NotFoundError("Catalog item");
        }

        this._assertSameType(items);

        const fieldSets = items.map((item) => ({
            id: item.cid,
            label: `${item.brand_name} ${item.model_name}`,
            fields: this._comparableFields(item),
        }));

        return this.assembler.build(fieldSets);
    }

    _fetchItems(cids) {
        return this.productDAO.findManyForCompare(cids);
    }

    _assertSameType(items) {
        const type = items[0].item_type;
        const allSame = items.every((item) => item.item_type === type);

        if (!allSame) {
            throw new ValidationError(
                "Can only compare items of the same type",
            );
        }
    }

    /**
     * This method must be implemented by each compare handler.
     * @param {object} _item The item to get the comparable fields for.
     * @returns {string[]} The comparable fields for the item.
     */
    _comparableFields(_item) {
        throw new InternalError("_comparableFields not implemented");
    }
}

export default CatalogCompareHandler;
