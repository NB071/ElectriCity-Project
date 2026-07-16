/**
 * TC_08 - Catalog Service - Vehicle Customization
 * UC9
 *
 * Expected: customization options listed; configurations can be created and
 * retrieved without auth / without adding to cart. Some categories are mandatory
 * (SINGLE); MULTI categories are optional add-ons.
 */
import catalogService from "../services/catalog/catalog.service.js";
import { getForItem } from "../services/catalog/_options/optionsQuery.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";
import { ACTIVE_CID } from "./helpers/tddFixtures.js";
import { deleteConfiguration } from "./helpers/cleanup.js";

describe("TC_08 Catalog Service - Vehicle Customization (UC9)", () => {
    test("vehicle details expose customization option groups", async () => {
        const detail = await catalogService.getCatalogItemDetails(ACTIVE_CID);

        expect(Array.isArray(detail.customizations)).toBe(true);
        expect(detail.customizations.length).toBeGreaterThanOrEqual(1);

        for (const category of detail.customizations) {
            expect(category).toHaveProperty("category_id");
            expect(category).toHaveProperty("name");
            expect(category).toHaveProperty("select_type");
            expect(Array.isArray(category.options)).toBe(true);
        }
    });

    test("options query returns grouped options without requiring cart membership", async () => {
        const groups = await getForItem(ACTIVE_CID);
        expect(Array.isArray(groups)).toBe(true);
        expect(groups.length).toBeGreaterThanOrEqual(1);
        expect(groups.every((g) => Array.isArray(g.options))).toBe(true);
    });

    test("select_type indicates mandatory SINGLE vs optional MULTI categories", async () => {
        const groups = await getForItem(ACTIVE_CID);
        const types = new Set(groups.map((g) => g.select_type));
        expect(types.has("SINGLE") || types.has("MULTI")).toBe(true);
    });

    test("createConfiguration builds a priced config from selected option_ids", async () => {
        const groups = await getForItem(ACTIVE_CID);
        const optionIds = groups
            .filter((g) => g.select_type === "SINGLE")
            .map((g) => g.options[0].option_id);

        expect(optionIds.length).toBeGreaterThanOrEqual(1);

        const config = await catalogService.createConfiguration({
            cid: ACTIVE_CID,
            option_ids: optionIds,
        });
        const configId =
            config.config_id ?? config.id ?? config.configuration_id;

        try {
            expect(configId).toBeTruthy();
            expect(Number(config.total_price ?? config.price)).toBeGreaterThan(0);
            expect(
                Array.isArray(
                    config.selected_options || config.options || config.categories,
                ),
            ).toBe(true);

            const loaded = await catalogService.getConfigurationById(configId);
            expect(loaded.config_id ?? loaded.id ?? loaded.configuration_id).toBe(
                configId,
            );
        } finally {
            await deleteConfiguration(configId);
        }
    });

    test("createConfiguration rejects option_ids not available for the item", async () => {
        await expect(
            catalogService.createConfiguration({
                cid: ACTIVE_CID,
                option_ids: [999_999],
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });

    test("getConfigurationById rejects unknown config ids", async () => {
        await expect(
            catalogService.getConfigurationById(9_999_999),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
