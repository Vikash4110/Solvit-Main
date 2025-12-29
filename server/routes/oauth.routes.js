import { Router } from 'express';
import { getGoogleLoginPage } from '../controllers/oauth.controller.js';

const oauthRouter = Router();

oauthRouter.route('/show-google-login-page').get(getGoogleLoginPage);

export { oauthRouter };
