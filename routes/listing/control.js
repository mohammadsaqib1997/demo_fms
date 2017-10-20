var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/listing/control', function (req, res, next) {

    res.render('download_templates/list_control', req.body, function (errJade, html) {
        if (errJade) {
            return res.json({status: "failed", message: "Jade Error!"});
        } else {
            let time = new Date().getTime();
            let fileDes = __dirname + "/../../public/temp/" + time + ".pdf";
            pdf.create(html).toStream(function(err, stream){
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

router.post('/html/listing/control', function (req, res, next) {

    res.render('download_templates/list_control', req.body, function (errJade, html) {
        if (errJade) {
            return res.json({status: "failed", message: "Jade Error!"});
        } else {
            let time = new Date().getTime();
            let fileDes = __dirname + "/../../public/temp/" + time + ".html";
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

router.post('/csv/listing/control', function (req, res, next) {

    let time = new Date().getTime();
    let fileDes = __dirname + "/../../public/temp/" + time + ".csv";

    let fields = ['id', 'name'];
    let data = [];

    let fetchData = req.body.fetchData;
    let keys = Object.keys(fetchData);

    keys.forEach(function (key) {
        let row = fetchData[key];
        let gen = {};
        gen['id'] = key;
        gen['name'] = row.name;
        data.push(gen);
    });

    let csv = json2csv({ data: data, fields: fields });

    fs.writeFile(fileDes, csv, function(err) {
        if (err){
            res.json({status: "failed", message: "Write Error!"});
        }else{
            res.json({status: "ok", link: "/temp/"+time+".csv", name: time+".csv"});
        }
    });
});

module.exports = router;