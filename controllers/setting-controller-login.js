const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');


const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = mongoose.model('User');
const Post = mongoose.model('Post');

var util = require('./util');

module.exports = function (router) {


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








};
