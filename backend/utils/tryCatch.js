// Design Pattern / Technique: Decorator pattern / Higher-Order Function
// Inspired by: https://javascript.plainenglish.io/how-i-set-up-a-global-error-handler-in-express-js-and-why-you-should-too-800d80770cce (article)

// This High-oder function acts as a wrapper for all controller functions.
const tryCatch = (controller) => async (req, res, next) => {
    try {
        return await controller(req, res, next);
    } catch (error) {
        return next(error);
    }
};

export default tryCatch;
