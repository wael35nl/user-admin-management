import User from "../models/users.js";
import { errorResponse, successResponse } from "../helpers/responseHandler.js";

const getAll = async (req, res) => {
    try {
        if (req.url === '/' && req.method === 'GET') {
            const users = await User.find({}, { _id: 1, name: 1, email: 1, phone: 1 });
            if (!users.length) return errorResponse(res, 404, 'No users found');

            successResponse(res, 200, 'All users', { users });
        }
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

export { getAll };