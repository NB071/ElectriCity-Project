import { ValidationError } from "../../../utils/errors.js";
import {
    validateMediaInput,
    validateImageMediaInput,
    validatePdfMediaInput,
    validateCatalogImageInput,
} from "../../../services/media/mediaValidator.js";

describe("mediaValidator", () => {
    test("validateMediaInput accepts image and pdf types", () => {
        expect(
            validateMediaInput({
                url: "https://cdn.example.com/a.jpg",
                file_type: "image/jpeg",
            }).file_type,
        ).toBe("image/jpeg");
        expect(
            validateMediaInput({
                url: "https://cdn.example.com/a.pdf",
                file_type: "application/pdf",
            }).file_type,
        ).toBe("application/pdf");
    });

    test("rejects unsupported type / blank url", () => {
        expect(() =>
            validateMediaInput({
                url: "https://x.com/a.exe",
                file_type: "application/exe",
            }),
        ).toThrow(ValidationError);
        expect(() =>
            validateMediaInput({ url: "", file_type: "image/jpeg" }),
        ).toThrow(ValidationError);
    });

    test("image vs pdf schemas", () => {
        expect(
            validateImageMediaInput({
                url: "https://cdn.example.com/a.png",
                file_type: "image/png",
            }).file_type,
        ).toBe("image/png");
        expect(() =>
            validateImageMediaInput({
                url: "https://cdn.example.com/a.pdf",
                file_type: "application/pdf",
            }),
        ).toThrow(ValidationError);

        expect(
            validatePdfMediaInput({
                url: "https://cdn.example.com/r.pdf",
                file_type: "application/pdf",
            }).file_type,
        ).toBe("application/pdf");
        expect(() =>
            validatePdfMediaInput({
                url: "https://cdn.example.com/r.pdf",
                file_type: "application/pdf",
                is_primary: true,
            }),
        ).toThrow(ValidationError);
    });

    test("catalog image link input", () => {
        const link = validateCatalogImageInput({
            cid: 1,
            media_id: 2,
            display_order: 0,
            is_primary: false,
        });
        expect(link.cid).toBe(1);
        expect(() =>
            validateCatalogImageInput({ cid: -1, media_id: 1 }),
        ).toThrow(ValidationError);
        expect(() =>
            validateCatalogImageInput({ cid: 1, media_id: 1, display_order: -1 }),
        ).toThrow(ValidationError);
    });
});
