var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/listing/sub_control', function (req, res, next) {

    res.render('download_templates/list_sub_control', req.body, function (errJade, html) {
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

router.post('/html/listing/sub_control', function (req, res, next) {

    res.render('download_templates/list_sub_control', req.body, function (errJade, html) {
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

router.post('/csv/listing/sub_control', function (req, res, next) {

    let time = new Date().getTime();
    let fileDes = __dirname + "/../../public/temp/" + time + ".csv";

    let fields = ['control_id', 'sub_control_id', 'name'];
    let data = [];

    let fetchData = req.body.fetchData;
    let cKeys = Object.keys(fetchData.cont_data);

    cKeys.forEach(function (cKey) {
        let cRow = fetchData.cont_data[cKey];
        let gen = {};
        gen['control_id'] = cRow.id;
        gen['sub_control_id'] = '';
        gen['name'] = cRow.name;
        data.push(gen);
        let scKeys = Object.keys(fetchData.sub_cont_data);
        scKeys.forEach(function (scKey) {
            let scRow = fetchData.sub_cont_data[scKey];
            if(scRow.cont_id === cRow.id) {
                let gen = {};
                gen['control_id'] = '';
                gen['sub_control_id'] = scRow.id;
                gen['name'] = scRow.name;
                data.push(gen);
            }
        });
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