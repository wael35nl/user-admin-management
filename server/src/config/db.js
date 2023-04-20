import mongoose from 'mongoose';

import dev from '../config/index.js';

const connectDB = async () => {
    try {
        await mongoose.connect(dev.db.userAdmin);
        console.log('DB is connected');
    } catch (error) {
        console.log('DB is not connected');
        console.log(error);
    }
}

export default connectDB;