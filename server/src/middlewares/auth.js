import { errorResponse } from "../helpers/responseHandler.js";

const isLoggedIn = (message = 'Please log in') => {
    const loggedIn = (req, res, next) => {
        try {
            if (req.session.userId) {
                next();
            } else {
                return errorResponse(res, 400, message);
            }
        } catch (error) {
            return errorResponse(res, 500, error.message);
        }
    }
    return loggedIn;
}

const isLoggedOut = (req, res, next) => {
    try {
        if (req.session.userId) {
            return errorResponse(res, 400, 'You\'re already logged in');
        }
        next();
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

export { isLoggedIn, isLoggedOut };