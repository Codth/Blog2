const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

const User = mongoose.model('User');
const Post = mongoose.model('Post');

const elasticlunr = require('elasticlunr');

var util = require('./util');







// Search router
router.get('/', util.paginatedResults(Post, {}, 12,'search'), (req, res) => {
    const query = req.query.q;

    const result =  elastic(query);
    console.log(result);
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








module.exports = router;