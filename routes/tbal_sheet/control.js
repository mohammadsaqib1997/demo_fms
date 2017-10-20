var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/tbal_sheet/control', function (req, res, next) {

    res.render('download_templates/tbs_control', req.body, function (errJade, html) {
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

router.post('/html/tbal_sheet/control', function (req, res, next) {

    res.render('download_templates/tbs_control', req.body, function (errJade, html) {
        if (errJade) {
            console.log(errJade);
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

router.post('/csv/tbal_sheet/control', function (req, res, next) {

    let time = new Date().getTime();
    let fileDes = __dirname + "/../../public/temp/" + time + ".csv";

    let fields = [
        'code',
        'account_description',
        'debit_balance_opening',
        'credit_balance_opening',
        'debit_activity',
        'credit_activity',
        'debit_balance_closing',
        'credit_balance_closing',
    ];
    let data = [];

    let fetchData = req.body.fetchData;

    fetchData.data.forEach(function (item) {
        let gen = {};
        gen['code'] = item.id;
        gen['account_description'] = item.name;
        gen['debit_balance_opening'] = item.totODr;
        gen['credit_balance_opening'] = item.totOCr;
        gen['debit_activity'] = item.totDr;
        gen['credit_activity'] = item.totCr;
        gen['debit_balance_closing'] = item.totCDr;
        gen['credit_balance_closing'] = item.totCCr;
        data.push(gen);
    });
    let gen = {};
    gen['code'] = '';
    gen['account_description'] = 'Grand Total (Rs.)';
    gen['debit_balance_opening'] = fetchData.reqData.grTotODr;
    gen['credit_balance_opening'] = fetchData.reqData.grTotOCr;
    gen['debit_activity'] = fetchData.reqData.grTotDr;
    gen['credit_activity'] = fetchData.reqData.grTotCr;
    gen['debit_balance_closing'] = fetchData.reqData.grTotCDr;
    gen['credit_balance_closing'] = fetchData.reqData.grTotCCr;
    data.push(gen);

    let last = {};
    last['code'] = '';
    last['account_description'] = '';
    last['debit_balance_opening'] = '';
    last['credit_balance_opening'] = '';
    last['debit_activity'] = '';
    last['credit_activity'] = '';
    last['debit_balance_closing'] = 'Difference';
    last['credit_balance_closing'] = fetchData.reqData.grTotCDr - fetchData.reqData.grTotCCr;
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