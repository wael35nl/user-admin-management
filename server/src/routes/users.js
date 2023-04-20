import formidable from 'express-formidable';
import { Router } from 'express';

import { registerUser, verifyEmail, loginUser, logoutUser, userProfile } from '../controllers/users.js';

const router = Router();

router.post('/register', formidable(), registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', loginUser);
router.get('/profile', userProfile);
router.get('/logout', logoutUser);

export default router;