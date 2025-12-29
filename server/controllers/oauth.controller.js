//Oauth Google using Arctic
import * as arctic from 'arctic';
import { oauthGoogle } from '../lib/oAuth/oauthGoogle.js';

const getGoogleLoginPage = async (_, res) => {
  const state = arctic.generateState();
  const codeVerifier = arctic.generateCodeVerifier();
  const scope = ['openid', 'profile', 'email'];
  const url = oauthGoogle.createAuthorizationURL(state, codeVerifier, scope);
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log('******************************');
  console.log(codeVerifier, state);
  console.log('******************************');
  console.log(url.toString());

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    maxAge: 10 * 60 * 1000, // 10
  };
  res.cookie('google_code_verifier', codeVerifier, options);
  res.cookie('google_oauth_state', state, options);
  res.redirect(url.toString());
};

export { getGoogleLoginPage };
