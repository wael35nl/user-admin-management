import { Router } from 'express';
import formidable from 'express-formidable';
import session from 'express-session';

import dev from '../config/index.js';
import { registerUser, verifyEmail, loginUser, forgetPassword, resetPassword, userProfile, updateUser, deleteUser, logoutUser } from '../controllers/users.js';
import { isLoggedIn, isLoggedOut } from '../middlewares/auth.js';

const userRouter = Router();

userRouter.use(session({
    name: 'user-session',
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 }
}));

userRouter.post('/register', formidable(), registerUser);
userRouter.post('/verify-email', verifyEmail);
userRouter.post('/login', isLoggedOut, loginUser);
userRouter.post('/forget-password', isLoggedOut, forgetPassword);
userRouter.post('/reset-password', isLoggedOut, resetPassword);
userRouter.route('/profile')
    .get(isLoggedIn(), userProfile)
    .put(isLoggedIn(), formidable(), updateUser)
    .delete(isLoggedIn(), deleteUser);
userRouter.get('/logout', isLoggedIn('You\'re already logged out'), logoutUser);

export default userRouter;