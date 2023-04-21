import jwt from 'jsonwebtoken';
import fs from 'fs';

import User from "../models/users.js";
import { securePassword, comparePassword } from "../helpers/securePassword.js";
import dev from '../config/index.js';
import { sendEmailWithNodeMailer } from '../helpers/email.js';

const getAllUsers = async (req, res) => {
    try {
        if (req.url === '/' && req.method === 'GET') {
            const users = await User.find({}, { _id: 1, name: 1, email: 1, phone: 1 });
            return res.status(200).json({ message: 'All users', users });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

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
                message: 'Minimum length for the password is 6'
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
            return res.status(400).json({
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

        res.status(200).json({
            message: 'login successful', user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

const userProfile = (req, res) => {
    try {
        res.status(200).json({ message: 'return user profile' });
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
        res.redirect('/');
        res.status(200).json({ message: 'logout successful' });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export { getAllUsers, registerUser, verifyEmail, loginUser, logoutUser, userProfile };