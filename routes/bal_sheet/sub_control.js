var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/bal_sheet/sub_control', function (req, res, next) {

    res.render('download_templates/bs_sub_control', req.body, function (errJade, html) {
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

router.post('/html/bal_sheet/sub_control', function (req, res, next) {

    res.render('download_templates/bs_sub_control', req.body, function (errJade, html) {
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

router.post('/csv/bal_sheet/sub_control', function (req, res, next) {

    let time = new Date().getTime();
    let fileDes = __dirname + "/../../public/temp/" + time + ".csv";

    let fields = ['id', 'head_of_account', 'debit', 'credit'];
    let data = [];

    let fetchData = req.body.fetchData;

    fetchData.data.forEach(function (item) {
        let gen = {};
        gen['id'] = item.id;
        gen['head_of_account'] = item.name;
        gen['debit'] = item.totDr;
        gen['credit'] = item.totCr;
        data.push(gen);
    });
    let gen = {};
    gen['id'] = '';
    gen['head_of_account'] = 'Grand Total (Rs.)';
    gen['debit'] = fetchData.reqData.grTotDr;
    gen['credit'] = fetchData.reqData.grTotCr;
    data.push(gen);
    let last = {};
    last['id'] = '';
    last['head_of_account'] = 'Difference';
    last['debit'] = ((fetchData.reqData.grTotDr - fetchData.reqData.grTotCr) > -1) ? fetchData.reqData.grTotDr - fetchData.reqData.grTotCr : '';
    last['credit'] = ((fetchData.reqData.grTotDr - fetchData.reqData.grTotCr) < 0) ? fetchData.reqData.grTotDr - fetchData.reqData.grTotCr : '';
    data.push(last);

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