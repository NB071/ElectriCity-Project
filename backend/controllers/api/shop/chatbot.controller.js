import tryCatch from "../../../utils/tryCatch.js";
import apiResponse from "../../../utils/apiResponse.js";

export const sampleController = tryCatch(async (req, res, next) => {
    // TODO: implement This controller
    const responseData = { message: "TODO" };
    return apiResponse(res, responseData, 200);
});
