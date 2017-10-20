module.exports  = {
    decode_key: function (id) {
        var PUSH_CHARS= "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
        id = id.substring(0,8);
        var timestamp = 0;
        for (var i=0; i < id.length; i++) {
            var c = id.charAt(i);
            timestamp = timestamp * 64 + PUSH_CHARS.indexOf(c);
        }
        return timestamp;
    },
    getDate: function (date) {
        return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
    },
    set_date_ser: function (date) {
        var h_obj = this.get_12_hours(date.getHours());
        return h_obj.hour+":"+("0"+date.getMinutes()).slice(-2)+" "+h_obj.ap+" "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    },
    get_12_hours: function(hours){
        var ap = ['AM', 'PM'];
        return { hour: ("0" + (hours % 12)).slice(-2), ap: ap[Math.floor(hours/12)] }
    },
    sortObj: function sortObject(o, bool) {
        bool = (typeof bool !== "undefined") ? bool: true;
        var sorted = {},
            key, a = Object.keys(o);
        if(bool){
            a.sort().reverse();
        }else{
            a.sort();
        }
        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    },
    sortObjByVal: function sortObject(o, key) {
        return o.sort(function(a, b){
            return (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0);
        });
    },
    genInvoiceNo: function (num, append, length) {
        num = num.toString();
        if(num.length < length){
            num = (append+num).slice(-length);
        }
        return num;
    },
    trim: function (val) {
        if(val.charAt(0) === " "){
            val = val.substr(1, val.length);
        }
        return val.replace(/\s{2,}/g, ' ');
    },
    isNumber: function (val, maxLength, def) {
        if (val !== "") {
            if (isNaN(val)) {
                return (val === "NaN") ? "":val.substr(0, val.toString().length-1);
            } else {
                if(maxLength){
                    if (val.length > maxLength) {
                        return val.substr(0, val.toString().length-1);
                    }
                }
                return parseInt(val);
            }
        } else {
            if(typeof def !== "undefined"){
                return def;
            }
            return 0;
        }
    },
    getObjId: function (sel_key, obj) {
        if (sel_key !== "") {
            if (typeof obj[sel_key] !== "undefined") {
                return (typeof obj[sel_key].id !== "undefined") ? obj[sel_key].id : "";
            }
        }
        return "";
    },
    getObjKeyVal: function (sel_key, obj, key) {
        if (sel_key !== "") {
            if (typeof obj[sel_key] !== "undefined") {
                return (typeof obj[sel_key][key] !== "undefined") ? obj[sel_key][key] : "";
            }
        }
        return "";
    },
    dbLoadMet: function (func, time, load) {
        let self = this;
        if(load !== null){
            clearTimeout(load);
            load = null;
            self.dbLoadMet(func, time);
        }else{
            load = setTimeout(func, time);
        }
    },
    compareArr: function (arr1, arr2) {
        return (arr1.length === arr2.length) && arr1.every(function (elm, ind) {
                return elm === arr2[ind];
            });
    },
};