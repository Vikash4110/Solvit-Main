// google-auth-setup.js
import {google} from "googleapis"
import readline from "readline"
import dotenv from "dotenv";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,        // Replace with your actual client ID
  process.env.GOOGLE_CLIENT_SECRET,    // Replace with your actual client secret  
  process.env.GOOGLE_REDIRECT_URI    // Usually http://localhost:3000/auth/callback
);

async function getRefreshToken() {
  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });

  console.log('🔗 Open this URL in your browser:');
  console.log(authUrl);
  console.log('\n');

  // Get authorization code from user
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const code = await new Promise((resolve) => {
    rl.question('Enter the authorization code from the callback URL: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('\n✅ Success! Here are your tokens:');
    console.log('📋 Copy these to your .env file:');
    console.log('\n' + '='.repeat(50));
    console.log(`GOOGLE_CLIENT_ID=${oauth2Client._clientId}`);
    console.log(`GOOGLE_CLIENT_SECRET=${oauth2Client._clientSecret}`);
    console.log(`GOOGLE_REDIRECT_URI=${oauth2Client.redirectUri}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error getting tokens:', error);
  }
}

getRefreshToken();
