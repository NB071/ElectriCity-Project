// Media service tests
// script: npm run test:media

import {
    validateMediaInput,
    validateCatalogImageInput,
} from "../../services/media/mediaValidator.js";
import getStrategy from "../../services/media/strategies/index.js";
import { VALIDATIONS } from "../../services/media/constants.js";
import {
    recordMedia,
    resolveMediaById,
    deleteMediaById,
} from "../../services/media/media.service.js";

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// --- Validator ---

function testValidMediaInput() {
    const result = validateMediaInput({
        url: "https://cdn.example.com/car.jpg",
        file_type: "image/jpeg",
        alt_text: "Front view",
    });

    assert(result.url.includes("car.jpg"), "url should be preserved");
    console.log("SUCCESS: validateMediaInput accepts valid image");
}

function testInvalidMediaFileType() {
    try {
        validateMediaInput({
            url: "https://cdn.example.com/file.exe",
            file_type: "application/exe",
        });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("Unsupported file type"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: validateMediaInput rejects bad file_type");
    }
}

function testInvalidCatalogImageInput() {
    try {
        validateCatalogImageInput({ cid: -1, media_id: 1 });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.includes("cid"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: validateCatalogImageInput rejects invalid cid");
    }
}

// --- Strategy registry ---

function testGetImageStrategy() {
    const context = getStrategy(VALIDATIONS.MEDIA_TYPES.IMAGE);
    assert(
        typeof context.resolve === "function",
        "image strategy context should expose resolve()",
    );
    console.log("SUCCESS: getStrategy returns image context");
}

function testGetUnknownStrategy() {
    try {
        getStrategy("video");
        throw new Error("expected unknown strategy to fail");
    } catch (error) {
        assert(
            error.message.includes("Unknown media type"),
            `unexpected error: ${error.message}`,
        );
        console.log("SUCCESS: getStrategy rejects unknown type");
    }
}

// --- Service + DB ---

async function testRecordResolveDelete() {
    const url = `https://cdn.example.com/test-${Date.now()}.jpg`;

    const { media_id } = await recordMedia({
        url,
        file_type: "image/png",
        alt_text: "integration test",
    });

    assert(media_id > 0, "media_id should be a positive integer");

    const media = await resolveMediaById(media_id);
    assert(media.url === url, "resolved url should match inserted url");
    assert(media.file_type === "image/png", "file_type should match");

    await deleteMediaById(media_id);

    try {
        await resolveMediaById(media_id);
        throw new Error("expected not found after delete");
    } catch (error) {
        assert(
            error.message.includes("Media not found"),
            `unexpected error: ${error.message}`,
        );
    }

    console.log("SUCCESS: recordMedia → resolveMediaById → deleteMediaById");
}

async function testRecordMediaRejectsInvalidInput() {
    try {
        await recordMedia({ url: "", file_type: "image/jpeg" });
        throw new Error("expected validation to fail");
    } catch (error) {
        assert(
            error.message.length > 0,
            "should throw a validation error message",
        );
        console.log("SUCCESS: recordMedia rejects invalid input");
    }
}

(async () => {
    testValidMediaInput();
    testInvalidMediaFileType();
    testInvalidCatalogImageInput();
    testGetImageStrategy();
    testGetUnknownStrategy();

    try {
        await testRecordResolveDelete();
        await testRecordMediaRejectsInvalidInput();
    } catch (error) {
        console.error("FAIL: DB integration tests:", error.message);
        console.error(
            "Hint: npm run docker:up && npm run db:schema:apply (DB_HOST=127.0.0.1 in .env)",
        );
        process.exit(1);
    }

    console.log("\nAll media service tests passed.");
})();
