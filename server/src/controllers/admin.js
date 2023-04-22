import User from "../models/users.js";
import { comparePassword } from "../helpers/securePassword.js";

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).json({
                message: 'Something is messing'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Minimum length for the password is 6'
            });
        }
        const admin = await User.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                message: 'This admin doesn\'t exist. Please register/signup first'
            });
        }

        if (admin.is_admin === 0) {
            return res.status(400).json({
                message: 'Not an admin'
            });
        }

        const isPasswordMatched = await comparePassword(password, admin.password);

        if (!isPasswordMatched) {
            return res.status(400).json({
                message: 'email/password doesn\'t match'
            });
        }

        req.session.userId = admin._id;

        res.status(200).json({ message: 'login successful' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await User.find({ is_admin: 0 });
        res.status(200).json({ message: 'return all users', users: allUsers });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const logoutAdmin = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('admin-session');
        res.status(200).json({ message: 'logout successful' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export { loginAdmin, getAllUsers, logoutAdmin };