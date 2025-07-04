require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDb = require('./database/connection.js');
const cookieParser = require('cookie-parser')
const app = express();



app.use(cors({
    origin: ['http://localhost:5173',],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

app.use(express.json());
app.use(cookieParser())














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
