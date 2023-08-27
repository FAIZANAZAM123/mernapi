const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config({ path: './config.env' });
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    }
    ,
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    interests: [
        {
            type: String,
            required: true,
        }
    ],
    profileImage: {
        type: String,
        default:''
        // default: 'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png'
    },
    education: {
        type: String,
        required: true
    },
    
    messages: [
        {
            name: {
                type: String,
                required: true
            }
            ,
            email: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            }
        }
    ],
    likedBlogs: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Blog",
            required: true
        }
    ],
    blogs: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Blog",
            required: true
        }


    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        console.log("here ", this.password)
    }
    next();
})
userSchema.methods.generateAuthToken = async function () {
    try {
        let tokenss = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);

        this.tokens = this.tokens.concat({ token: tokenss })


        await this.save();
        return tokenss
    } catch (error) {

    }
}
userSchema.methods.addmessage = async function (name, email, message) {
    try {
        this.messages = this.messages.concat({ name: name, email: email, message: message });


        await this.save();
        return this.messages;


    } catch (error) {

    }
}
userSchema.methods.addliked = async function (blogId) {
    try {
        if (!this.likedBlogs.includes(blogId)) {
            this.likedBlogs.push(blogId);
            await this.save();
        }
        return this.likedBlogs;
    }
    catch (err) {
        console.log(err);
    }

}
userSchema.methods.unlikeBlog = async function (blogId) {
    try {

        this.likedBlogs = this.likedBlogs.filter((currentBlogId) => currentBlogId.toString() !== blogId.toString());


        await this.save();
        return this.likedBlogs;
    } catch (error) {
        console.log(error);
    }
}




const User = new mongoose.model('Registration', userSchema);

module.exports = User;

