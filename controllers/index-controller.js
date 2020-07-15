

const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');


const User = mongoose.model('User');
const Post = mongoose.model('Post');

var util = require('./util');


// router.get('/', (req, res) => {
//     res.render("view/index", {
//         header: "Index",
//         indicator: req.isAuthenticated(),
//         user: req.user
//     });
// });
//
//

router.get('/', util.paginatedResults(Post, {privacy: 'Public'}, 12,''), (req, res) => {
    Post.find({}).sort({ viewtimes: 'desc' }).exec(function(err, docs) {
        var rotate= [];
        for(var i =0; i<5;i++){
            rotate.push(docs[i]);
        }
        res.render("view/show/show", {
            header: "Show Room",
            indicator: req.isAuthenticated(),
            user: req.user,
            post: res.paginatedResults,
            series :  res.series,
            jump : res.jump,
            highlight : res.highlight,
            rotate: rotate
        });
    });
});




router.get('/show', util.paginatedResults(Post, {privacy: 'Public'}, 12,''), (req, res) => {
    Post.find({}).sort({ viewtimes: 'desc' }).exec(function(err, docs) {
        var rotate= [];
        for(var i =0; i<5;i++){
            rotate.push(docs[i]);
        }
        res.render("view/show/show", {
            header: "Show Room",
            indicator: req.isAuthenticated(),
            user: req.user,
            post: res.paginatedResults,
            series :  res.series,
            jump : res.jump,
            highlight : req.query.page,
            rotate: rotate
        });
    });
});




router.get('/category/:param', util.paginatedResults(Post, {privacy: 'Public'}, 12,'category'), (req, res) => {

    Post.find({}).sort({ viewtimes: 'desc' }).exec(function(err, docs) {
        let populars= [];
        for(var i =0; i<6; i++){
            populars.push(docs[i]);
        }
        res.render("view/category", {
            header: "category",
            title: req.params.param,
            indicator: req.isAuthenticated(),
            user: req.user,
            post: res.paginatedResults,
            series :  res.series,
            jump : res.jump,
            highlight : req.query.page,
            popular: populars
        });
    });
});







// router.get('/single-standard', (req, res) => {
//     res.render("view/single-standard", {
//         header: "Standard",
//         indicator: req.isAuthenticated(),
//         user: req.user
//     });
// });
//
//
//
// router.get('/single-audio', (req, res) => {
//     res.render("view/single-audio", {
//         header: "audio"
//     });
// });


router.get('/acknowledge', (req, res) => {
    res.render("view/acknowledge", {
        header: "acknowledge"
    });
});

router.get('/search', util.elastic(Post, 12), (req, res) => {

    res.render("view/show/show", {
        header: "Search result",
        title: req.query.type,
        indicator: req.isAuthenticated(),
        user: req.user,
        post: res.paginatedResults,
        series :  res.series,
        jump : res.jump,
        highlight : req.query.page,
        query: req.query.q,
        size:res.size
    });

});



module.exports = router;