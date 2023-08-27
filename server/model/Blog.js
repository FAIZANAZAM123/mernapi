const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['heading', 'paragraph', 'image'],
        required: true
    },
    value: {
        type: String,
        required: true
    }
});
const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Registration"
    }
});
const BlogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    content: [ContentSchema],
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Registration",
        required: true
    },
    comments: [CommentSchema],
    claps: [{
        user: {
            type: mongoose.Types.ObjectId,
            ref: "Registration"
        }
    }],
    
    
});


BlogSchema.methods.addcomment = async function (comment, userId) {
    try {
        this.comments = this.comments.concat({ comment: comment, user: userId });


        await this.save();
        return this.comments;


    } catch (error) {

    }
 }
BlogSchema.methods.addclap = async function(userId) {
    const userHasClapped = this.claps.some(clap => clap.user && clap.user.toString() === userId.toString());
    
    if (userHasClapped) {
        // Remove the user's 
        console.log("removing the clap")
        this.claps = this.claps.filter(clap => clap.user && clap.user.toString() !== userId.toString());
    } else {
        // Add a clap for the user
        console.log("going to clap")

        this.claps.push({ user: userId });
    }

    await this.save();
    return this.claps;
};


const Blog = mongoose.model("Blog", BlogSchema);


module.exports = Blog;
