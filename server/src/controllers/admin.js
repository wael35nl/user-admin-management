import User from "../models/users.js";
import { comparePassword } from "../helpers/securePassword.js";
import { errorResponse, successResponse } from "../helpers/responseHandler.js";

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return errorResponse(res, 404, 'something is messing');
        if (password.length < 6) return errorResponse(res, 400, 'Minimum length for the password is 6 characters');

        const admin = await User.findOne({ email });
        if (!admin) return errorResponse(res, 404, 'This admin doesn\'t exist. Please register/signup first');
        if (admin.is_admin === 0) return errorResponse(res, 400, 'Not an admin');

        const isPasswordMatched = await comparePassword(password, admin.password);
        if (!isPasswordMatched) return errorResponse(res, 400, 'email/password doesn\'t match');

        req.session.userId = admin._id;

        successResponse(res, 200, 'Login successful');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({ is_admin: 0 });
        if (!allUsers.length) return errorResponse(res, 404, 'No users found');

        successResponse(res, 200, 'All users', { users: allUsers });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const logoutAdmin = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('admin-session');
        successResponse(res, 200, 'Logout successful');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

export { loginAdmin, getAllUsers, logoutAdmin };