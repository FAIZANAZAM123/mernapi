const express = require('express');
const app = express();
 const cors = require('cors');
const dotenv=require("dotenv")
const mongoose = require("mongoose");
const User=require('./model/users');

dotenv.config({path:'./config.env'});
require('./db/conn')
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
const path=require('path');
// const corsOptions = {
//     origin: 'http://localhost:5000',
//     credentials: true,
//   };
  app.use(cors());
//ROUTES

app.use(require('./router/userauth'));

app.use(require('./router/blog-route'));

const port = process.env.PORT||3000

app.listen(port, () => console.log(`Server running on port ${port} 🔥`)); 