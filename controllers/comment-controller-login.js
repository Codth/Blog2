const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');


const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');



var util = require('./util');

module.exports = function (router) {


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


};