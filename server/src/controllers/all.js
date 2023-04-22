import User from "../models/users.js";

const getAll = async (req, res) => {
    try {
        if (req.url === '/' && req.method === 'GET') {
            const users = await User.find({}, { _id: 1, name: 1, email: 1, phone: 1 });
            return res.status(200).json({ message: 'All users', users });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export { getAll };