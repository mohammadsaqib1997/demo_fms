const temp_dir = __dirname + '/../public/temp/';
const fs = require('fs');
const moment = require('moment');

setInterval(function () {
    const list_files = fs.readdirSync(temp_dir);
    let serverTime = moment();
    console.log("Start Job -- Time: "+serverTime.format('DD/MM/YYYY'));
    if(list_files.length > 0){
        list_files.forEach(function (fileFName) {
            let info = fs.statSync(temp_dir+fileFName);
            let checkTime = moment(info.birthtime);
            let diff = serverTime.diff(checkTime);
            let duration = moment.duration(diff).get("days");
            if(duration > 0){
                fs.unlinkSync(temp_dir+fileFName);
            }
        });
    }else{
        console.log("Files not found!");
    }
}, 86400000);

// day limit 1 day(86400000)
