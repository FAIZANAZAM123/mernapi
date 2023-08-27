const user = require('../model/users');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
// const CLIENT_ID = '1035114720658-os83srdr4ffqp750h7as3u4oporb06js.apps.googleusercontent.com'
// const CLIENT_SECRET = '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'
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground'
// const REFRESH_TOKEN = '1//042wjE0-h2KnqCgYIARAAGAQSNwF-L9IrsptJhbRuCkK9c8VQBi6JHWeFLvepTNNlESzaXY9M1AIDKqSXnhqtHOHdP_8JCRl59ek'


const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const fs=require('fs');



exports.register = async (req, res) => {
    try {
        console.log(req.body.name);
        const { name, email, phone, password, profileimage, education } = req.body;

        const interests = JSON.parse(req.body.interests);
        const profileImage = req.file.path;
        console.log(name, email, phone, password, profileimage, education, interests)

        if (!name || !email || !phone || !password || !education, !interests) {
            return res.status(422).json({ error: "Please fill all the fields" });
        }

        const response = await user.findOne({ email: email });
        console.log(response);
        if (response && response.email === req.body.email) {
            console.log('response found');
            res.status(422).json({ error: 'User Already exists' })
        }
        else {
            const user1 = new user({
                name: name,
                email: email,
                phone: phone,
                password: password,
                education: education,

                interests: interests,
                profileImage,

                blogs: []
            });
            await console.log(user1);
            await user1.save();
            if (user1) {
                res.status(201).json({ message: 'User Registered Successfully' });
            }
        }
    } catch (error) {
        console.log(error);

    }
};
exports.signIn = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;
        console.log(email);
        console.log(password);
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all the fields' });
        }
        const response = await user.findOne({ email: email });

        if (!response) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
        console.log("response:", response);
        const ismatch = await bcrypt.compare(password, response.password);
        if (response && response.email === email && ismatch) {
            const token = await response.generateAuthToken();
            console.log('The token is ', token);
            res.cookie('jwtoken', token, {
                expires: new Date(Date.now() + 180000000000),
                httpOnly: true
            })
            console.log(response.name);
            res.status(201).json({
                message: "you are logged in successfully",
                userName: response.name,
                userId: response._id,
            });
        }
        else {
            res.status(500).json({ message: "invalid credentials" })

        }
    } catch (error) {
        console.log(error);
    }
}

exports.logout = (req, res) => {

    res.clearCookie('jwtoken', { path: '/' });
    res.send('User Logout');

}



exports.getContact = (req, res) => {
    console.log("User authenticated. Sending user data.");
    console.log('This is rootuser', req.rootuser);
    res.send(req.rootuser);

}
exports.postContact = async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.json({ message: 'Invalid Credentials' });
    }

    const data = await user.findOne({ _id: req.userID });

    if (data) {
        await data.addmessage(name, email, message);
        await data.save();
        res.status(200).json('Message sent successfully')
    }

}
exports.sendEmail = async (req, res) => {

    const { name, email, message, bloggeremail } = req.body;
    console.log(bloggeremail);
    console.log(name, email, message, bloggeremail);
    if (!name || !message || !email || !bloggeremail) {
        return res.json({ message: "please fill all fields" });
    }
    else {
        const accessToken = await oAuth2Client.getAccessToken();
        console.log(email, message, bloggeremail);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'faizanazam6980@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        });
        const mailOptions = {
            from: '"BlogAPP📑"<faizanazam6980@gmail.com>',
            to: bloggeremail,
            subject: `${name} sends you this message Through Blog App`,
            text: message,
        };
        try {
            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Email sent!' });
        } catch (error) {
            console.error('Failed to send the email:', error);
            res.status(500).json({ error: 'Failed to send the email.' });
        }
    }
}
exports.getAllUsers = async (req, res) => {
    let Users;
    try {
        Users = await user.find();


    } catch (error) {
        console.log(error)
    }
    if (!Users) {
        return res.status(404).json({ message: "no user found" })
    }
    return res.status(200).json({ Users });
}



exports.editUser = (req, res) => {
    console.log("User authenticated. Sending user data.");
    console.log('This is rootuser', req.rootuser);
    res.send(req.rootuser);

}
exports.likedBlogs = async (req, res) => {
    try {
        const userData = await user.findById(req.userID).populate('likedBlogs');
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(userData.likedBlogs);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.likeBlogbyId = async (req, res) => {
    try {
        console.log("Comed here")

        const { blogId } = req.params;
        console.log(blogId);
        const userData = await user.findById(req.userID);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        await userData.addliked(blogId);
        await userData.save();
        res.status(200).json({ message: 'Blog liked successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
exports.unlikeBlogbyblogID = async (req, res) => {
    try {
        console.log("comed here in delete")
        const { blogId } = req.params;
        const userData = await user.findById(req.userID);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        await userData.unlikeBlog(blogId);
        await userData.save();
        res.status(200).json({ message: 'Blog unliked successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.updatedata = async (req, res) => {
    try {
        const { name, email, phone, education, password } = req.body;
        if (!name || !email || !phone || !education || !password) {
            return res.status(422).json({ error: "Please fill all the fields" });
        }
        const profileImage = req.file ? req.file.path : undefined;

        const currentUser = await user.findById(req.params.id);
        if (!currentUser) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log(currentUser)

        currentUser.name = name;
        currentUser.email = email;
        currentUser.phone = phone;
        currentUser.education = education;
        console.log(currentUser.profileImage);
        if (profileImage) {
            if (currentUser.profileImage) {
                fs.unlinkSync(currentUser.profileImage);
            }
            
        currentUser.profileImage = profileImage;
        }
        currentUser.password = password;

        await currentUser.save();

        res.status(200).json({ message: 'User updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}