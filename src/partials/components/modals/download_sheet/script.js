export default {
    props: ['fetchData' , 'optionalData', 'dLinks'],
    created: function () {
        let self = this;


    },
    data: function () {
        return {
            pdfLoader: false,
            pdfDownload: null,
            pdfFile: '',
            pdfCounter: 5,

            htmlLoader: false,
            htmlDownload: null,
            htmlFile: '',
            htmlCounter: 5,

            csvLoader: false,
            csvDownload: null,
            csvFile: '',
            csvCounter: 5,
        }
    },
    watch: {
        pdfDownload: function (val) {
            let self  = this;
            if(val !== null){
                let interval = setInterval(function () {
                    self.pdfCounter--;
                    if(self.pdfCounter === 0){
                       clearInterval(interval);
                       let anch = document.getElementById('pdfDownload');
                       anch.click();
                    }
                }, 1000);
            }
        },
        htmlDownload: function (val) {
            let self  = this;
            if(val !== null){
                let interval = setInterval(function () {
                    self.htmlCounter--;
                    if(self.htmlCounter === 0){
                       clearInterval(interval);
                       let anch = document.getElementById('htmlDownload');
                       anch.click();
                    }
                }, 1000);
            }
        },
        csvDownload: function (val) {
            let self  = this;
            if(val !== null){
                let interval = setInterval(function () {
                    self.csvCounter--;
                    if(self.csvCounter === 0){
                       clearInterval(interval);
                       let anch = document.getElementById('csvDownload');
                       anch.click();
                    }
                }, 1000);
            }
        }
    },
    methods: {
        pdf: function () {
            let self = this;
            self.pdfLoader= true;
            self.$http.post(self.dLinks['pdf'], {
                fetchData: self.fetchData,
                optionalData: self.optionalData,
            }).then(function (res) {
                if(res.body.status === "ok"){
                    self.pdfDownload = res.body.link;
                    self.pdfFile = res.body.name;
                }else{
                    console.log(res.body.message);
                }
                self.pdfLoader= false;
            }, function (err) {
                console.log(err);
                self.pdfLoader= false;
            });
        },
        html: function () {
            let self = this;
            self.htmlLoader= true;
            self.$http.post(self.dLinks['html'], {
                fetchData: self.fetchData,
                optionalData: self.optionalData,
            }).then(function (res) {
                if(res.body.status === "ok"){
                    self.htmlDownload = res.body.link;
                    self.htmlFile = res.body.name;
                }else{
                    console.log(res.body.message);
                }
                self.htmlLoader= false;
            }, function (err) {
                console.log(err);
                self.htmlLoader= false;
            });
        },
        csv: function () {
            let self = this;
            self.csvLoader= true;
            self.$http.post(self.dLinks['csv'], {
                fetchData: self.fetchData,
                optionalData: self.optionalData,
            }).then(function (res) {
                if(res.body.status === "ok"){
                    self.csvDownload = res.body.link;
                    self.csvFile = res.body.name;
                }else{
                    console.log(res.body.message);
                }
                self.csvLoader= false;
            }, function (err) {
                console.log(err);
                self.csvLoader= false;
            });
        }
    }
}