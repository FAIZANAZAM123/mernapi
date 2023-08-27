const express = require('express');
const router = express.Router();
const authenticate = require('../Middleware/authenticate');
const userController = require('../Controllers/UsersController');

// const { google } = require('googleapis');
// const CLIENT_ID = '1035114720658-os83srdr4ffqp750h7as3u4oporb06js.apps.googleusercontent.com'
// const CLIENT_SECRET = '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'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = '1//042wjE0-h2KnqCgYIARAAGAQSNwF-L9IrsptJhbRuCkK9c8VQBi6JHWeFLvepTNNlESzaXY9M1AIDKqSXnhqtHOHdP_8JCRl59ek'
// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const multer = require('multer');
const fs = require('fs');
const dir = './uploads';

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const upload = multer({ storage: storage });
router.post("/register", upload.single('profileImage'), userController.register);
router.post("/signin", userController.signIn);
router.get("/logout", authenticate, userController.logout);
router.get("/contact", authenticate, userController.getContact);
router.post("/contact", authenticate, userController.postContact);
router.post("/sendEmail", authenticate, userController.sendEmail)
router.get("/getAll", authenticate, userController.getAllUsers);
router.get("/edituser", authenticate, userController.editUser);
router.get("/likedBlogs", authenticate, userController.likedBlogs);
router.post("/likeBlog/:blogId", authenticate, userController.likeBlogbyId);
router.delete("/unlikeBlog/:blogId", authenticate, userController.unlikeBlogbyblogID);
router.patch("/editdata/:id", authenticate,upload.single('profileImage'), userController.updatedata);
module.exports = router;