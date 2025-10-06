import express from 'express';
import { getPriceConstraints } from '../controllers/price-contoller.js';
import { verifyJWTCounselor } from '../middlewares/counselorAuth-middleware.js';

const priceRouter = express.Router();

priceRouter.route('/constraints').get(verifyJWTCounselor, getPriceConstraints);
export { priceRouter };
