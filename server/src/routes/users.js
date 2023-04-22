import { Router } from 'express';
import formidable from 'express-formidable';
import session from 'express-session';

import dev from '../config/index.js';
import { getAllUsers, registerUser, verifyEmail, loginUser, forgetPassword, resetPassword, userProfile, logoutUser, updateUser, deleteUser } from '../controllers/users.js';
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
userRouter.post('/forget-password', forgetPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.get('/profile', isLoggedIn(), userProfile);
userRouter.get('/logout', isLoggedIn('You\'re already logged out'), logoutUser);
userRouter.put('/profile', isLoggedIn(), formidable(), updateUser);
userRouter.delete('/profile', isLoggedIn(), deleteUser);

export default userRouter;