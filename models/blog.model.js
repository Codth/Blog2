const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: String
    },
    description:{
        type: String,
        default: 'Nothing to say ~'
    },
    avatar:{
        data: String,
        contentType: String,
        name: String
    }
});


var CommentSchema = new mongoose.Schema({
    commentor: String,
    commentor_avatar: String,
    date: String,
    messageContent: String,
    sub: [this]
});


const postSchema = new mongoose.Schema({
    author: {
       type: Schema.Types.ObjectID, ref:'User'
    },
    author_name:{
        type: String
    },
    serial:{
        type: Number
    },
    title:{
        type: String,
    },
    intro:{
        type: String,
    },
    img:{
        data: String,
        contentType: String,
        name: String
    },
    imgRec:{
        data: String,
        contentType: String,
        name: String
    },
    content:{
        type: String,
    },
    comments: [CommentSchema],
    date: {
        type: String
    },
    category:{
        type: String
    },
    privacy:{
        type: String
    },
    viewtimes:{
        type: Number,
        default: 0
    }

});

const catTitleSchema = new mongoose.Schema({
    title:{
        type: String
    },
    line:{
        type: String
    }
});




// Custom validation for email
UserSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

mongoose.model('User', UserSchema);
mongoose.model('Post', postSchema);
mongoose.model('catTitile', catTitleSchema);
mongoose.model('Comment', CommentSchema);



// mongoose.model('Sub', secCommentSchema);