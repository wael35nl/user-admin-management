import { Router } from 'express';
import session from 'express-session';

import dev from '../config/index.js';
import { isLoggedIn, isLoggedOut } from '../middlewares/auth.js';
import { loginAdmin, getAllUsers, deleteUserByAdmin, logoutAdmin } from '../controllers/admin.js';

const adminRouter = Router();

adminRouter.use(session({
    name: 'admin-session',
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 }
}));

adminRouter.post('/login', isLoggedOut, loginAdmin);
adminRouter.get('/dashboard', isLoggedIn(), getAllUsers);
adminRouter.delete('/dashboard/:id', isLoggedIn(), deleteUserByAdmin);
adminRouter.get('/logout', isLoggedIn('You\'re already logged out'), logoutAdmin);

export default adminRouter;