var express = require('express');
var router = express.Router();
var func = require("./../custom_libs/func.js");
var csrf = require("csurf");

router.get('/', csrf(), function (req, res, next){
    res.render('vue_app', {_csrf: req.csrfToken()});
});

module.exports = router;