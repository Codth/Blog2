const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');
var globalSecret;


var util = require('./util');
var helper = require('../helper/encryption');
// require('./setting-controller-Login')(router);
// require('./comment-controller-Login')(router);
// require('/test-controller-Login')(router);



//-------------------------------------------------------------------------------------------------


// Login Page
router.get('/login', (req, res) => res.render('view/login', {layout: false}));

// Register Page
router.get('/register', (req, res) => res.render('view/register', {layout: false}));

// Forget Page
router.get('/forget', (req, res) => res.render('view/reset_pw/forget', {layout: false}));


// reCheck code AJAX
router.post('/recheck', (req, res) => {
    req.on('data',function(data) {
        obj=JSON.parse(data);
        console.log(obj);


        let name = obj.name;
        let email = obj.email;

        globalSecret=  Math.floor(Math.random() * 100000);
        console.log('secert: ' + globalSecret);

        // Send email here
        util.sendEmail(name, email, globalSecret);
        // Send cookie to client
        res.cookie("check code", globalSecret, { secure:true, maxAge:6000, httpOnly: false });
    });
});



// Forget password
router.post('/forget', (req, res) => {
    var name;
    var email =  req.body.email;

    User.findOne({email: email}, (err, doc) => {
        if(doc){
            name = doc.name;
            let email_encryped = 'http://localhost:3000/users/forget/auth/' + helper.encry(email);
            util.forgetEmail(name, email, email_encryped);
        }else{
            res.render('view/reset_pw/forget', {
                error: 'No Email was found',
                email,
                layout: false
            });

        }
    });
});


// Forget passby password
router.get('/forget/auth/:email_encryped', (req, res) => {
    res.render('view/reset_pw/resetting', {
        email: req.params.email_encryped,
        layout: false
    });
});

// Forget passby password
router.post('/forget/auth/:email_encryped', (req, res) => {

    var email = helper.decry(req.params.email_encryped);
    const {password, password2} = req.body;
    let errors = [];

    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    if(errors.length>0){

    }else{
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) throw err;
                User.findOneAndUpdate({ email: email }, {password: hash}, { new: true }, (err, doc) => {
                    if (!err) { res.redirect('/users/login'); }
                });
            });
        });
        res.redirect('/users/login');
    }

});





// Register
router.post('/register', (req, res) => {
    const { name, email, password, password2,secret } = req.body;
    Post.find({email: email}, function (err, post_email) {

        const date = util.getDate();
        let errors = [];

        console.log(post_email);
        if(post_email.length != 0){
            errors.push({msg: 'Email is already existed'});
        }

        if (!name || !email || !password || !password2) {
            errors.push({ msg: 'Please enter all fields' });
        }

        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
        }


        if (globalSecret != secret) {
            errors.push({ msg: 'Verification code is wrong' });
        }


        if (password.length < 6) {
            errors.push({ msg: 'Password must be at least 6 characters' });
        }

        if (errors.length > 0) {
            res.render('view/register', {
                errors,
                name,
                email,
                password,
                password2,
                layout: false
            });

        } else {
            User.findOne({ email: email }).then(user => {
                if (user) {
                    errors.push({ msg: 'Email already exists' });
                    res.render('view/register', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        layout: false
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password,
                        date
                    });


                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;
                            newUser.password = hash;
                            newUser
                                .save()
                                .then(user => {
                                    req.flash(
                                        'success_msg',
                                        'You are now registered and can log in'
                                    );
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });


                }
            });
        }
    });
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});


// Empty
router.get('/empty',ensureAuthenticated, (req, res) => {
        res.render('view/empty',{
             header: "empty",
            indicator: req.isAuthenticated(),
             user: req.user

    })
});

router.get('/newpost',ensureAuthenticated, (req, res) => {
    res.render('view/post/newpost',{
        header: "new post",
        indicator: req.isAuthenticated(),
        user: req.user
    })
});


router.post('/newpost', (req, res) => {
    Post.find({}, function (err, all) {

        let temp = all[all.length-1].serial;

        var post = new Post();

        post.category = req.body.category;
        post.privacy = req.body.privacy;
        post.author = req.user.id;
        post.author_name = req.user.name;
        post.title = req.body.title;
        post.intro = req.body.introduction;
        post.serial = temp + 1;
        // post.serial = 0;

        let img = JSON.parse(req.body.img);
        let imgRec = JSON.parse(req.body.imgRec);

        post.img.data = "data:" + img.type + ";charset=utf-8;base64," + img.data.toString('base64');
        post.img.contentType = img.type;
        post.img.name = img.name;

        post.imgRec.data = "data:" + imgRec.type + ";charset=utf-8;base64," + imgRec.data.toString('base64');
        post.imgRec.contentType = imgRec.type;
        post.imgRec.name = imgRec.name;


        // post.img.data = "data:" + req.files['img'].mimetype + ";charset=utf-8;base64," + req.files['img'].data.toString('base64');
        // post.img.contentType = req.files['img'].mimetype;
        // post.img.name = req.files['img'].name;
        //
        // post.imgRec.data = "data:" + req.files['imgRec'].mimetype + ";charset=utf-8;base64," + req.files['imgRec'].data.toString('base64');
        // post.imgRec.contentType = req.files['imgRec'].mimetype;
        // post.imgRec.name = req.files['imgRec'].name;

        post.content = req.body.texting;
        post.date = util.getDate();


        post.save((err, doc) => {
            if (!err){
                let url = "/users/single/" + post.id;
                res.redirect(url);
            }
        });






    });
});


// Get the Single page
router.get('/single/:id', (req, res) => {
    run();
    var times;
    async function run(){
        await Post.findById(req.params.id, function (err, adventure) {
            times  = adventure.viewtimes;
            if(req.user) {
                if (req.user.id != adventure.author) {
                    times++;
                }
            }else{
                times++;
            }
    });


        await Post.findByIdAndUpdate(req.params.id, {viewtimes: times}, (err, doc) => {

            User.findById(doc.author, (err, people) => {
                Post.find({serial: {$gt: doc.serial}}, (err,next) => {
                    let next_one = next[0];
                    Post.find({serial: {$lt: doc.serial}}, (err,previous) => {
                        let previous_one = previous[previous.length-1];

                        if (!err) {
                            res.render("view/show/single", {
                                header: "new post",
                                indicator: req.isAuthenticated(),
                                user: req.user,
                                post: doc,
                                author: people,
                                commentsNum: doc.comments.length,
                                next: next_one,
                                previous: previous_one
                            });
                        }else{
                            console.log('problem occurs');
                        };



                    });
                });
            });
        });
    }
});


router.get('/myposts/:id', (req, res) => {


    Post.find({author: req.params.id}, (err, doc) => {
        res.render("view/post/myposts", {
            header: "My Posts",
            indicator: req.isAuthenticated(),
            user: req.user,
            doc: doc
        });
    });
});



router.get('/single/modify/:id', (req, res) => {

    Post.findById(req.params.id, (err, doc) => {
        if (!err) {
            res.render("view/post/editpost", {
                header: "Edit Post",
                indicator: req.isAuthenticated(),
                user: req.user,
                doc: doc
            });
        }
    });

});



router.get('/single/delete/:id', ensureAuthenticated,  (req, res) => {
    Post.findByIdAndRemove(req.params.id, (err, doc) => {
        if (!err) {
            res.redirect(req.get('referer'));
        }
        else { console.log('Error in employee delete :' + err); }
    });
});


// Circular Helper Method
router.post('/single/modify/:id', (req, res) => {
    const update = {category:req.body.category, privacy:req.body.privacy, title:req.body.title, intro:req.body.introduction, content:req.body.texting, date:util.getDate()};
    if(req.files){
        if(req.files['img']){
            const img = {data: "data:image/jpeg;base64," + req.files['img'].data.toString('base64'), contentType:req.files['img'].mimetype, name:req.files['img'].name};
            update.img = img;
        }

        if(req.files['imgRec']){
            const imgRec = {data: "data:image/jpeg;base64," + req.files['imgRec'].data.toString('base64'), contentType:req.files['imgRec'].mimetype, name:req.files['imgRec'].name};
            update.imgRec = imgRec;
        }
    }
    Post.findByIdAndUpdate(req.params.id, update, { new: true }, (err, doc) => {
        if (!err) {
            let url = "/users/single/" + req.params.id;
            res.redirect(url);
        } else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("employee/addOrEdit", {
                    viewTitle: 'Update Employee',
                    employee: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
});



router.get('/category/:param', util.paginatedResults(Post, {}, 12,'userid'), (req, res) => {
    res.render("view/category", {
        header: "Individual Category",
        title: req.query.type,
        indicator: req.isAuthenticated(),
        user: req.user,
        post: res.paginatedResults,
        series :  res.series,
        jump : res.jump,
        highlight : req.query.page

    });
});







router.get('/single/img/showroom/:id', (req, res) => {
    var seq = req.query.seq;
    Post.findById(req.params.id, (err, doc) => {
        if (!err) {
            let target;
            if(seq == 1){
                target = doc.img;
            }else{
                target = doc.imgRec;
            }
            res.render("view/post/imgShowroom", {
                header: "Image",
                indicator: req.isAuthenticated(),
                user: req.user,
                doc: target
            });
        }
    });
});






router.get('/setting/:id', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, doc) => {
        if(!err){
            res.render("view/setting/setting", {
                header: "Setting",
                indicator: req.isAuthenticated(),
                user: req.user,
                doc: doc
            });
        }
    });
});




// User edit setting
router.get('/setting/edit/:id', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, doc) => {
        doc.save((err, doc) => {
            res.render("view/setting/setting-edit", {
                header: "Setting Edit",
                indicator: req.isAuthenticated(),
                user: req.user,
                doc: doc
            });
        });
    });
});


router.post('/setting/edit/:id', (req, res) => {
    User.findById(req.params.id, (err, doc) => {

        if(req.body.img){
            let img = JSON.parse(req.body.avatar);
            doc.avatar.contentType = img.type;
            doc.avatar.name = img.name;
            console.log(img.name);
            doc.avatar.data="data:" + img.type + ";charset=utf-8;base64," + img.data.toString('base64');
        }

        doc.name = req.body.name;
        doc.email = req.body.email;
        doc.description  =req.body.description;

        doc.save((err, doc) => {
            res.render("view/setting/setting", {
                header: "Setting",
                indicator: req.isAuthenticated(),
                user: req.user,
                doc: doc
            });
        });
    });
});


// User show
router.get('/show/:id', util.paginatedResults(Post, {}, 12,'userShow'), (req, res) => {

    User.findById(req.params.id, (err, person) => {

        res.render("view/show/user_show", {
            header: "Individual Show",
            title: req.query.type,
            indicator: req.isAuthenticated(),
            user: req.user,
            post: res.paginatedResults,
            series :  res.series,
            jump : res.jump,
            highlight : req.query.page,
            person: person
        });
    });
});


router.post('/single/comment/:id', ensureAuthenticated, (req, res) => {

    let post_id = req.params.id;
    let user_id = req.user.id;

    console.log(req.body.parentid);
    if(req.body.parentid){
        User.findById(user_id, (err, people) => {

            Post.findById(post_id, (err, doc) => {

                for(var i =0; i<doc.comments.length; i++){
                    if(doc.comments[i].id == req.body.parentid) {

                        var comment = new Comment();
                        comment.commentor = people.name;
                        comment.commentor_avatar = people.avatar.data;

                        comment.date = util.getDate();
                        comment.messageContent = req.body.cMessage;
                        comment.level =  parseInt(req.body.levelform);
                        comment.parent = req.body.parentid;



                        doc.comments[i].sub.push(comment);
                        doc.save((err, doc) => {
                            if(!err){
                                console.log('ok');
                                res.redirect(req.get('referer'));
                            }else{
                                console.log(err);
                            }
                        });
                    }
                }

            });
        });

    }else{

        User.findById(user_id, (err, people) => {
            Post.findById(post_id, (err, doc) => {
                var comment = new Comment();
                comment.commentor = people.name;
                comment.commentor_avatar = people.avatar.data;

                comment.date = util.getDate();
                comment.messageContent = req.body.cMessage;
                comment.level =  parseInt(req.body.levelform);
                comment.parent = req.body.parentid;

                doc.comments.push(comment);

                doc.save((err, doc) => {
                    if(!err){
                        console.log('ok');
                        res.redirect(req.get('referer'));
                    }else{
                        console.log(err);
                    }
                });
            });
        });



    }

});

router.post('/single/fuck/:id',ensureAuthenticated, (req, res) => {

    let child_id = req.body.Comment_id;
    let parent_id = req.body.parent_id;
    let  post_id = req.params.id;
    let level = req.body.level;

    let newContent = req.body.newContent;
    let position;


    if(level==1){
        Post.findById(post_id, (err, doc) => {
            var comment = doc.comments.id(parent_id);

            comment.messageContent = newContent;
            comment.markModified('comment');

            doc.save((err, doc) => {
                if(!err){
                    console.log('ok');
                    res.redirect(req.get('referer'));
                }else{
                    console.log(err);
                }
            });
        });

    }else{
        Post.findById(post_id, (err, doc) => {
            var comment = doc.comments.id(parent_id);
            for(var i=0; i< comment.sub.length; i++){
                if(comment.sub[i]._id == child_id){
                    position = i;
                    break;
                }
            }

            comment.sub[position].messageContent = newContent;
            comment.markModified('sub');

            doc.save((err, doc) => {
                if(!err){
                    console.log('ok');
                    res.redirect(req.get('referer'));
                }else{
                    console.log(err);
                }
            });
        });
    }
});


router.get('/single/comment/delete/:id', (req, res) => {
    let child_id = req.query.Comment_id;
    let parent_id = req.query.parent_id;
    let level = req.query.level;

    let  post_id = req.params.id;
    let position;


    if(level==1){

        Post.findById(post_id, (err, doc) => {
            for(var i=0; i< doc.comments; i++){
                if(doc.comments[i]._id == parent_id){
                    position = i;
                    break;
                }
            }

            doc.comments.splice(position, 1);
            doc.markModified('comments');

            doc.save(function (err) {
                if(err) {
                    console.error('ERROR!');
                }else{
                    console.log('ok');
                    res.redirect(req.get('referer'));
                }

            });
        });

    }else{
        Post.findById(post_id, (err, doc) => {
            var comment = doc.comments.id(parent_id);
            for(var i=0; i< comment.sub.length; i++){
                if(comment.sub[i]._id == child_id){
                    position = i;
                    break;
                }
            }

            comment.sub.splice(position, 1);
            comment.markModified('sub');

            doc.save(function (err) {
                if(err) {
                    console.error('ERROR!');
                }else{
                    console.log('ok');
                    res.redirect(req.get('referer'));
                }

            });


        });
    }



});



router.get("/test", (req, res, next) => {
    request.get("https://api.spacexdata.com/v3/launches/latest", (err, response, body) => {

        console.log(JSON.parse(body));
        res.render('view/show/test', {
            header: "Test",
            indicator: req.isAuthenticated(),
            user: req.user,
            data: JSON.parse(body),
            layout: false
        });
    });
});





module.exports = router;
