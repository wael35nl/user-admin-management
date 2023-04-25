import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import dev from './config/index.js';
import connectDB from './config/db.js';
import allRouter from './routes/all.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';

const app = express();
const PORT = dev.app.serverPort;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/user-admin-api/', allRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.status(200).json({ message: 'Testing route' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    await connectDB();
});