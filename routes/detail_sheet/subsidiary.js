var express = require('express');
var router = express.Router();
var fs = require('fs');
var pdf = require('html-pdf');
var json2csv = require('json2csv');

router.post('/pdf/detail_ledger/subsidiary', function (req, res, next) {

    res.render('download_templates/detail_ledger', req.body, function (errJade, html) {
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

router.post('/html/detail_ledger/subsidiary', function (req, res, next) {

    res.render('download_templates/detail_ledger', req.body, function (errJade, html) {
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

router.post('/csv/detail_ledger/subsidiary', function (req, res, next) {

    let time = new Date().getTime();
    let fileDes = __dirname + "/../../public/temp/" + time + ".csv";

    let fields = [
        'date',
        'document_no',
        'reference_no',
        'narration',
        'debit',
        'credit',
        'balance',
        'balance_type',
    ];
    let data = [];

    let fetchData = req.body.fetchData;

    let sub_header = {};
    sub_header['date'] = fetchData.reqData.code;
    sub_header['document_no'] = fetchData.reqData.codeName;
    sub_header['reference_no'] = '';
    sub_header['narration'] = 'Balance';
    sub_header['debit'] = fetchData.reqData.balance.balDr;
    sub_header['credit'] = fetchData.reqData.balance.balCr;
    sub_header['balance'] = fetchData.reqData.genBal = fetchData.reqData.balance.balDr - fetchData.reqData.balance.balCr;
    sub_header['balance_type'] = (fetchData.reqData.genBal >= 0) ? "Dr" : "Cr";
    data.push(sub_header);

    fetchData.data.forEach(function (item) {
        let gen = {};
        gen['date'] = item.date;
        gen['document_no'] = (item.type).toUpperCase();
        gen['reference_no'] = item.v_id;
        gen['narration'] = item.remarks;
        gen['debit'] = item.debit;
        gen['credit'] = item.credit;
        gen['balance'] = fetchData.reqData.genBal = (fetchData.reqData.genBal + item.debit) - item.credit;
        gen['balance_type'] = (fetchData.reqData.genBal >= 0) ? "Dr" : "Cr";
        data.push(gen);
    });

    let gen = {};
    gen['date'] = '';
    gen['document_no'] = '';
    gen['reference_no'] = '';
    gen['narration'] = '';
    gen['debit'] = fetchData.reqData.extra.totDr;
    gen['credit'] = fetchData.reqData.extra.totCr;
    gen['balance'] = '';
    gen['balance_type'] = '';
    data.push(gen);

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