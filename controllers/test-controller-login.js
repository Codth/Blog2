const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const request = require('request');

const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const User = mongoose.model('User');
const Post = mongoose.model('Post');
const Comment = mongoose.model('Comment');

var util = require('./util');


module.exports = function (router) {


// Test Route
// router.get('/test',  async (req, res) => {
//     let arr = [];
//
//      await function asyncProcess(doc,i) {
//              Post.findOne({ author: doc[i].author }). populate('name').exec(function (err, story) {
//                 return Promise.all(story);
//             });
//     };
//
//          Post.find({},function (err, doc) {
//             for(var i=0; i<doc.length; i++){
//                 let temp = asyncProcess(doc,i);
//                 arr.push(temp);
//             }
//
//         })
//
//     res.render("view/show/single", {
//         data: arr
//     });
//
// });


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


}
    // router.get("/test", (req, res, next) => {
    //     request('https://covid-19-data.p.rapidapi.com/help/countries', function (error, response, body) {
    //         if (!error && response.statusCode == 200) {
    //             console.log(body) // Show the HTML for the Google homepage.
    //         }
    //     });
    // });


//
// // Test Route
//     router.get('/test', (req, res) => {
//         // Post.update(
//         //     {},
//         //     { $set: { author_name: ''}},
//         //     {"multi": true}).then((result, err) => {
//         //             if(!err){
//         //                 console.log('ok');
//         //             }
//         // })
//
//
//         // res.render('view/empty',{
//         //     header: "Test",
//         //     indicator: req.isAuthenticated(),
//         //     user: req.user,
//         //     data: 6
//         // })
//     });
// };