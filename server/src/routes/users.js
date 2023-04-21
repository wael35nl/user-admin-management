import { Router } from 'express';
import formidable from 'express-formidable';
import session from 'express-session';

import dev from '../config/index.js';
import { getAllUsers, registerUser, verifyEmail, loginUser, logoutUser, userProfile } from '../controllers/users.js';
import { isLoggedIn, isLoggedOut } from '../middlewares/auth.js';

const userRouter = Router();

userRouter.use(session({
    name: 'user-session',
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 }
}));

userRouter.get('/', getAllUsers);
userRouter.post('/register', formidable(), registerUser);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/login', isLoggedOut, loginUser);
userRouter.get('/profile', isLoggedIn, userProfile);
userRouter.get('/logout', logoutUser);

export default userRouter;