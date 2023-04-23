import jwt from 'jsonwebtoken';
import fs from 'fs';

import User from "../models/users.js";
import { successResponse, errorResponse } from '../helpers/responseHandler.js';
import { securePassword, comparePassword } from "../helpers/securePassword.js";
import dev from '../config/index.js';
import { sendEmailWithNodeMailer } from '../helpers/email.js';

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.fields
        const { image } = req.files;
        if (!name || !email || !password || !phone) return errorResponse(res, 400, 'Something is messing');
        if (password.length < 6) return errorResponse(res, 400, 'Minimum length for the password is 6 characters');
        if (image && image.size > 1000000) return errorResponse(res, 400, 'Maximum size for mage is 1mb');

        const isExist = await User.findOne({ email });
        if (isExist) return errorResponse(res, 400, 'This user already exists');

        const hashedPassword = await securePassword(password);
        const token = jwt.sign({ name, email, hashedPassword, phone, image }, dev.app.jwtSecretKey, { expiresIn: '10m' });
        const emailData = {
            email,
            subject: 'Account activation email',
            html: `
            <h2>Hello ${name}!</h2>
            <p>Please click here to <a href='${dev.app.clientUrl}/api/users/activate?token=${token}' target='_blank'>activate your account</a></p>`
        }

        sendEmailWithNodeMailer(emailData);

        successResponse(res, 200, 'a verification link has been sent to your email', { token });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const verifyEmail = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return errorResponse(res, 404, 'Token is messing');

        jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
            if (err) return errorResponse(res, 401, 'Token is expired');

            const isExist = await User.findOne({ email });
            if (isExist) return errorResponse(res, 400, 'This user already exists');

            const { name, email, hashedPassword, phone, image } = decoded;
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                phone
            });

            if (image) {
                newUser.image.data = fs.readFileSync(image.path);
                newUser.image.contentType = image.type;
            }

            const user = await newUser.save();
            if (!user) return errorResponse(res, 400, 'user wasn\'t created');

            successResponse(res, 201, 'user was created, ready to sign in');
        });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return errorResponse(res, 404, 'something is messing');
        if (password.length < 6) return errorResponse(res, 400, 'Minimum length for the password is 6 characters');

        const user = await User.findOne({ email });
        if (!user) return errorResponse(res, 400, 'This user doesn\'t exist. Please register/signup first');

        const isPasswordMatched = await comparePassword(password, user.password);
        if (!isPasswordMatched) return errorResponse(res, 400, 'email/password doesn\'t match');

        req.session.userId = user._id;

        successResponse(res, 200, 'Login successful');

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return errorResponse(res, 404, 'something is messing');
        if (password.length < 6) return errorResponse(res, 400, 'Minimum length for the password is 6 characters');

        const user = await User.findOne({ email });
        if (!user) return errorResponse(res, 404, 'user wasn\'t found with this email address');

        const hashedPassword = await securePassword(password);
        const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, { expiresIn: '10m' });
        const emailData = {
            email,
            subject: 'Resetting password email',
            html: `
            <h2>Hello ${user.name}!</h2>
            <p>Please click here to <a href='${dev.app.clientUrl}/api/users/reset-password?token=${token}' target='_blank'>reset password</a></p>`
        }

        sendEmailWithNodeMailer(emailData);

        successResponse(res, 200, 'an email has been sent for resetting password', { token });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return errorResponse(res, 404, 'Token is messing');

        jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
            if (err) return errorResponse(res, 401, 'token is expired');

            const isExist = await User.findOne({ email });
            if (!isExist) return errorResponse(res, 404, 'Couldn\'t find the user');

            const { email, hashedPassword } = decoded;
            const updatedData = await User.updateOne({ email }, { $set: { password: hashedPassword } });

            if (!updatedData) return errorResponse(res, 400, 'password wasn\'t rested');

            successResponse(res, 200, 'password rested successfully');
        });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId, { password: 0 })
        if (!user) return errorResponse(res, 404, 'User not found');

        successResponse(res, 200, 'user profile', { user });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.session.userId;
        const { name, phone, password } = req.fields
        const { image } = req.files;
        const hashedPassword = await securePassword(password);

        const user = await User.findByIdAndUpdate(id, { name, phone, password: hashedPassword }, { new: true });
        if (!user) return errorResponse(res, 400, 'User wasn\'t updated');

        if (image) {
            user.image.data = fs.readFileSync(image.path);
            user.image.contentType = image.type;
        }
        await user.save();

        successResponse(res, 200, 'User is updated', { user });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.session.userId;
        await User.findByIdAndDelete(id);

        successResponse(res, 200, 'User is deleted');

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const logoutUser = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('user-session');

        successResponse(res, 200, 'Logout successful');

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

export { registerUser, verifyEmail, loginUser, forgetPassword, resetPassword, userProfile, updateUser, deleteUser, logoutUser };