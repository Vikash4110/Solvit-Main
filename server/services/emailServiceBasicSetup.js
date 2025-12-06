import Brevo from '@getbrevo/brevo';

const apiInstance = new Brevo.TransactionalEmailsApi();

// Set API Key
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

// Email details
const sendSmtpEmail = {
  sender: { name: 'Solvit Counselling', email: 'system@solvitcounselling.com' },
  to: [{ email: 'sahiljamwal2720@gmail.com', name: 'Sahil Jamwal' }],
  subject: 'Your OTP Verification',
  htmlContent: `<h1>Your OTP is: 123456</h1>`,
};

apiInstance
  .sendTransacEmail(sendSmtpEmail)
  .then((data) => {
    console.log('Email sent successfully:', data);
  })
  .catch((error) => {
    console.error('Error sending email:', error);
  });
