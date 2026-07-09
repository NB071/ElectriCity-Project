// Vehicle Details Handler
// Design Pattern / Technique: GoF Template Method / Object-Oriented Programming (OOP)

import CatalogDetailsHandler from "./catalogDetailsHandler.js";
import { NotFoundError } from "../../../../utils/errors.js";
import { toVehicleDetailsDTO } from "../DTOs/vehicleDetailsDTO.js";
import { getPromotionsForItem } from "../../_promotions/promotionsQuery.js";
import { getCatalogReviewSummary } from "../../../review/reviewQuery.js";

/**
 * This template-method class is used to handle the details of a vehicle.
 * @class
 * @extends CatalogDetailsHandler
 * @see {@link https://refactoring.guru/design-patterns/template-method}
 */
class VehicleDetailsHandler extends CatalogDetailsHandler {
    /**
     * This method is used to fetch the subtype of a vehicle.
     * @protected
     * @param {number} cid
     * @returns {Promise<object>}
     */
    _fetchSubtype(cid) {
        return this.productDAO.findVehicleById(cid);
    }

    /**
     * This method is used to fetch the history of a vehicle.
     * @dependency Media Service
     * @param {number} cid
     * @returns {Promise<object>}
     */
    _fetchHistory(cid) {
        return this.productDAO.findVehicleHistoryByCid(cid);
    }

    /**
     * This method is used to assemble the details of a vehicle.
     * @override
     * @protected
     * @param {object} base Base catalog item details
     * @param {object} subtype Vehicle subtype details
     * @param {object[]} customizations Customization options
     * @param {object} history Vehicle history details
     * @returns {Promise<object>}
     */
    async _assemble({ base, subtype, customizations, history }) {
        let images = [];
        try {
            images = await this.mediaAdapter.getItemImages(base.cid);
        } catch (error) {
            if (!(error instanceof NotFoundError)) {
                throw error;
            }
        }

        let historyReport = null;
        if (history?.media_id) {
            try {
                historyReport = await this.mediaAdapter.getVehicleHistoryReport(
                    history.media_id,
                );
            } catch (error) {
                if (!(error instanceof NotFoundError)) {
                    throw error;
                }
            }
        }

        const promotions = await getPromotionsForItem(base.cid);
        const reviewSummary = await getCatalogReviewSummary(base.cid);

        return toVehicleDetailsDTO(
            base,
            subtype,
            customizations,
            history,
            images,
            historyReport,
            promotions,
            reviewSummary,
        );
    }
}

export default VehicleDetailsHandler;
