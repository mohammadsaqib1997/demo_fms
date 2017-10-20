var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/payment_plan', function (req, res, next) {

    res.render('download_templates/payment_plan', req.body, function (errJade, html) {
        if (errJade) {
            return res.json({status: "failed", message: "Jade Error!"});
        } else {
            let time = new Date().getTime();
            let fileDes = __dirname + "/../public/temp/" + time + ".pdf";
            pdf.create(html, {
                orientation: 'landscape'
            }).toStream(function(err, stream){
                if(err){
                    res.json({status: "failed", message: "Write Error!"});
                }else{
                    stream.pipe(fs.createWriteStream(fileDes));
                    res.json({status: "ok", link: "/temp/"+time+".pdf", name: time+".pdf"});
                }
            });
        }
    });
});

router.post('/html/payment_plan', function (req, res, next) {

    res.render('download_templates/payment_plan', req.body, function (errJade, html) {
        if (errJade) {
            console.log(errJade);
            return res.json({status: "failed", message: "Jade Error!"});
        } else {
            let time = new Date().getTime();
            let fileDes = __dirname + "/../public/temp/" + time + ".html";
            let stream = fs.createWriteStream(fileDes);
            stream.write(html, "UTF8");
            stream.end();
            stream.on('finish', function () {
                res.json({status: "ok", link: "/temp/"+time+".html", name: time+".html"});
            });
            stream.on('error', function () {
                res.json({status: "failed", message: "Write Error!"});
            });
        }
    });
});

module.exports = router;