var express = require('express');
var router = express.Router();
var cors = require('cors');

var https = require('https');
const gplace_key = require("../config/private.json").g_webservice_key;

router.get('/', cors(), function (req, res, next) {
    let input = req.query.input;
    let opt = {
        hostname: "maps.googleapis.com",
        path: encodeURI("/maps/api/place/autocomplete/json?types=(cities)&components=country:pk&input="+input+"&key="+gplace_key)
    };
    https.get(opt, function (response) {
        let completeResponse = '';
        response.on('data', function (chunk) {
            completeResponse += chunk;
        });
        response.on('end', function() {
            res.json(JSON.parse(completeResponse));
        });
    }).on('error', function (e) {
        res.send("Error: " + e.message);
    });
});

module.exports = router;