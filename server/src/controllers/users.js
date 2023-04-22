import jwt from 'jsonwebtoken';
import fs from 'fs';

import User from "../models/users.js";
import { securePassword, comparePassword } from "../helpers/securePassword.js";
import dev from '../config/index.js';
import { sendEmailWithNodeMailer } from '../helpers/email.js';

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.fields
        const { image } = req.files;

        if (!name || !email || !password || !phone) {
            return res.status(404).json({
                message: 'Something is messing'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Minimum length for the password is 6 characters'
            });
        }
        if (image && image.size > 1000000) {
            return res.status(400).json({
                message: 'Maximum size for mage is 1mb'
            });
        }

        const isExist = await User.findOne({ email });
        if (isExist) {
            return res.status(400).json({
                message: 'This user already exists'
            });
        }

        const hashedPassword = await securePassword(password);

        const token = jwt.sign({ name, email, hashedPassword, phone, image }, dev.app.jwtSecretKey, { expiresIn: '10m' });

        const emailData = {
            email,
            subject: 'Account activation email',
            html: `
            <h2>Hello ${name}!</h2>
            <p>Please click here to <a href='${dev.app.clientUrl}/api/users/activate?token=${token}' target='_blank'>activate your account</a></p>
            `
        }

        sendEmailWithNodeMailer(emailData);

        res.status(200).json({ message: 'a verification link has been sent to your email', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const verifyEmail = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(404).json({ message: 'token is messing' });
        }

        jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'token is expired' });
            }
            const { name, email, hashedPassword, phone, image } = decoded;
            const isExist = await User.findOne({ email });
            if (isExist) {
                return res.status(400).json({
                    message: 'This user already exists'
                });
            }

            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                phone,
                is_verified: 1
            });

            if (image) {
                newUser.image.data = fs.readFileSync(image.path);
                newUser.image.contentType = image.type;
            }

            const user = await newUser.save();
            if (!user) {
                res.status(400).json({ message: 'user wasn\'t created' });
            }

            res.status(201).json({ message: 'user was created, ready to sign in' });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const loginUser = async (req, res) => {
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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: 'This user doesn\'t exist. Please register/signup first'
            });
        }

        const isPasswordMatched = await comparePassword(password, user.password);

        if (!isPasswordMatched) {
            return res.status(400).json({
                message: 'email/password doesn\'t match'
            });
        }

        req.session.userId = user._id;

        res.status(200).json({ message: 'login successful' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).json({
                message: 'Something is messing'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'Minimum length for the password is 6 characters'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'user wasn\'t found with this email address' })
        }

        const hashedPassword = await securePassword(password);

        const token = jwt.sign({ email, hashedPassword }, dev.app.jwtSecretKey, { expiresIn: '10m' });

        const emailData = {
            email,
            subject: 'Resetting password email',
            html: `
            <h2>Hello ${user.name}!</h2>
            <p>Please click here to <a href='${dev.app.clientUrl}/api/users/reset-password?token=${token}' target='_blank'>reset password</a></p>
            `
        }

        sendEmailWithNodeMailer(emailData);

        res.status(200).json({ message: 'an email has been sent for resetting password', token })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(404).json({ message: 'token is messing' });
        }

        jwt.verify(token, dev.app.jwtSecretKey, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'token is expired' });
            }
            const { email, hashedPassword } = decoded;
            const isExist = await User.findOne({ email });
            if (!isExist) {
                return res.status(400).json({
                    message: 'Couldn\'t find the user'
                });
            }

            const updatedData = await User.updateOne({ email }, { $set: { password: hashedPassword } });

            if (!updatedData) {
                res.status(400).json({ message: 'password wasn\'t rested' });
            }

            res.status(200).json({ message: 'password rested successfully' });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId, { password: 0 })
        res.status(200).json({ ok: true, user });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const logoutUser = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('user-session');
        res.status(200).json({ message: 'logout successful' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.session.userId;
        const { name, phone, password } = req.fields
        const { image } = req.files;

        const hashedPassword = await securePassword(password);

        const user = await User.findByIdAndUpdate(id, { name, phone, password: hashedPassword }, { new: true });

        if (!user) {
            return res.status(400).json({ message: `Cannot update user` });
        }

        if (image) {
            user.image.data = fs.readFileSync(image.path);
            user.image.contentType = image.type;
        }

        await user.save();

        res.status(200).json({ message: 'User is updated', user });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const deleteUser = async (req, res) => {
    try {
        const id = req.session.userId;
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User is deleted' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export { registerUser, verifyEmail, loginUser, forgetPassword, resetPassword, userProfile, logoutUser, updateUser, deleteUser };