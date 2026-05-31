import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";

export const login = tryCatch(async (req, res, next) => {
    // TODO: implement login
    const responseData = { message: "TODO: login" };
    return apiResponse(res, responseData, "Login successful", 200);
});

export const register = tryCatch(async (req, res, next) => {
    // TODO: implement register
    const responseData = { message: "TODO: register" };
    return apiResponse(res, responseData, "Register successful", 201);
});

export const logout = tryCatch(async (req, res, next) => {
    // TODO: implement logout
    const responseData = { message: "TODO: logout" };
    return apiResponse(res, responseData, "Logout successful", 200);
});
