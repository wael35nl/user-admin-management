import excelJS from 'excelJS';

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

const logoutAdmin = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('admin-session');
        successResponse(res, 200, 'Logout successful');
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 2 } = req.query;
        const allUsers = await User.find({ is_admin: 0 }).limit(limit).skip((page - 1) * limit);
        if (!allUsers.length) return errorResponse(res, 404, 'No users found');

        /* load dashboard, pagination and search
        
            let search = req.query.search ? req.query.search : '';
        
            const usersData = await User.find({
                is_admin: 0,
                $or: [
                    {name: {$regex: '.*' + search + '.*', $options: 'i'}},
                    {email: {$regex: '.*' + search + '.*', $options: 'i'}},
                    {phone: {$regex: '.*' + search + '.*', $options: 'i'}},
                ],
            }).limit(limit).skip((page - 1) * limit);
        
            const count = await User.find({
                is_admin: 0,
                $or: [
                    {name: {$regex: '.*' + search + '.*', $options: 'i'}},
                    {email: {$regex: '.*' + search + '.*', $options: 'i'}},
                    {phone: {$regex: '.*' + search + '.*', $options: 'i'}},
                ],
            }).countDocuments();
        
            res.render('dashboard', {
                users: usersData,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                previousPage: page - 1,
                nextPage: page + 1,
            });
        */

        successResponse(res, 200, 'All users', { users: allUsers });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const exportUsersData = async (req, res) => {
    try {
        const workbook = new excelJS.Workbook();
        const workSheet = workbook.addWorksheet('Users');
        workSheet.columns = [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Password', key: 'password' },
            { header: 'Phone', key: 'phone' },
            { header: 'Is Admin', key: 'is_admin' },
            { header: 'Created At', key: 'createdAt' },
            { header: 'Image', key: 'image' },
            { header: 'Is Banned', key: 'isBanned' },
        ];

        const usersData = await User.find({ is_admin: 0 });
        usersData.map(user => workSheet.addRow(user));

        workSheet.getRow(1).eachCell(cell => cell.font = { bold: true });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'users.xlsx'
        );

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        });

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

const deleteUserByAdmin = async (req, res) => {
    try {
        const adminId = req.session.userId;
        const { id } = req.params;

        const admin = await User.findById(adminId);
        const user = await User.findById(id);
        if (!user) return errorResponse(res, 401, `No user found with this id ${id}`);

        if (admin.email === user.email) return errorResponse(res, 400, 'Admins can\'t delete themselves from the user\'s dashboard');

        await User.findByIdAndDelete(id);

        successResponse(res, 200, 'User is deleted');

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }
}

export { loginAdmin, logoutAdmin, getAllUsers, exportUsersData, deleteUserByAdmin };