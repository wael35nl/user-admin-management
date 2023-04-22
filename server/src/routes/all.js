import { Router } from 'express';

import { getAll } from '../controllers/all.js';

const allRouter = Router();

allRouter.get('/', getAll);

export default allRouter;