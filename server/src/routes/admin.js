import { Router } from 'express';
import session from 'express-session';

import dev from '../config/index.js';
import { isLoggedIn, isLoggedOut } from '../middlewares/auth.js';
import { loginAdmin, logoutAdmin, getAllUsers, exportUsersData, deleteUserByAdmin } from '../controllers/admin.js';

const adminRouter = Router();

adminRouter.use(session({
    name: 'admin-session',
    secret: dev.app.sessionSecretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 }
}));

// admin routes
adminRouter.post('/login', isLoggedOut, loginAdmin);
// adminRouter.get(admin profile);
// adminRouter.put(admin profile);
// adminRouter.delete(admin profile);
adminRouter.get('/logout', isLoggedIn('You\'re already logged out'), logoutAdmin);

// admin => users dashboard
adminRouter.get('/dashboard', isLoggedIn(), getAllUsers);
adminRouter.get('/dashboard/export-excel-data', exportUsersData); // Browser
adminRouter.delete('/dashboard/:id', isLoggedIn(), deleteUserByAdmin);

export default adminRouter;