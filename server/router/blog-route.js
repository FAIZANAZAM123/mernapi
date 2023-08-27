const express = require('express');
const Blogrouter = express.Router();
const Blog = require('../model/Blog')
const users = require('../model/users');
const mongoose = require("mongoose");
const BlogController=require('../Controllers/BlogController');
const authenticate = require('../Middleware/authenticate');
Blogrouter.get('/getBlogs', authenticate,BlogController.getBlogs);
Blogrouter.get('/getBlogs/:id', authenticate, BlogController.getBlogsbyId);

Blogrouter.get("/user/:id", BlogController.UserbyId);

Blogrouter.post("/clapblogs/:id", authenticate,BlogController.ClapBlogsbyId);

Blogrouter.post('/addblog', authenticate, BlogController.Addblog);

Blogrouter.post("/savecomment", authenticate, BlogController.SaveThecomment);











module.exports = Blogrouter;