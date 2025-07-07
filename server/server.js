import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDb from './database/connection.js';
import { clientRouter } from './routes/client-routes.js';

dotenv.config();

const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))
app.use(express.json({limit: '16kb' })) 
app.use(express.urlencoded({extended: true , limit:"16kb"}))
app.use(express.static('public'))
app.use(cookieParser())

// Client Routes
app.use('/api/v1/clients', clientRouter);

const Port = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(Port, () => {
      console.log(`Server is running on port ${Port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
  });
