import { Google } from 'arctic';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

export const oauthGoogle = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:5173/'
);

//just made the google instance using the arctic library
