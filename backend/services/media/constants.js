const VALIDATIONS = {
    MEDIA_TYPES: {
        IMAGE: "image",
        PDF: "pdf",
    },

    ALLOWED_FILE_TYPES: {
        IMAGE: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        PDF: ["application/pdf"],
    },

    MAX_URL_LENGTH: 500,
    MAX_ALT_TEXT_LENGTH: 255,
    MAX_DISPLAY_ORDER: 100,
};

export { VALIDATIONS };
