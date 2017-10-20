import firebase from 'firebase'
import func from '../../../../custom_libs/func'

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.masterDetailsRef = db.ref('/master_details');
        self.partyInformationRef = db.ref('/party_information');
        self.vouchersRef = db.ref('/vouchers');
        self.projectTypeItemsRef = db.ref('/project_type_items');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');

        self.vouchersRef.once('value', function (snap) {
            if (snap.numChildren() > 0) {
                let process_item = 0;
                snap.forEach(function (voucher) {
                    let item = voucher.val();
                    self.projectsRef.child(item.sel_project).once("value", function (proSnap) {
                        let proData = proSnap.val();
                        item['project'] = proData.name;
                        item['type'] = "jv";
                        item['gen_type'] = "Journal Voucher";
                        item['gen_date'] = self.formatDate(new Date(item.voucher_date));

                        if(item.ref_key !== ""){
                            if(item.ref_type === "pi"){
                                self.partyInformationRef.child(item.ref_key).once('value', function (piSnap) {
                                    let piData = piSnap.val();

                                    item['ref_gen'] = piData.id+" | "+piData.contact_name+" | "+piData.agent_name+" (Vendor Detail)";
                                    self.vouchersData[voucher.key] = item;
                                    process_item++;
                                    if(process_item === snap.numChildren()){
                                        self.vouchersData = func.sortObj(self.vouchersData, false);
                                        self.orgData = self.vouchersData;
                                        self.loadMasterDetails(self, function () {
                                            self.dataLoad1 = false;
                                        });
                                    }
                                });
                            }else if(item.ref_type === "md"){
                                self.masterDetailsRef.child(item.ref_key).once('value', function (mdSnap) {
                                    let mdData = mdSnap.val();
                                    item['ref_gen'] = mdData.id+" | "+mdData.allotee_name+" (Customer Detail)";

                                    self.vouchersData[voucher.key] = item;
                                    process_item++;
                                    if(process_item === snap.numChildren()){
                                        self.vouchersData = func.sortObj(self.vouchersData, false);
                                        self.orgData = self.vouchersData;
                                        self.loadMasterDetails(self, function () {
                                            self.dataLoad1 = false;
                                        });
                                    }
                                });
                            }else{
                                self.vouchersData[voucher.key] = item;
                                process_item++;
                                if(process_item === snap.numChildren()){
                                    self.vouchersData = func.sortObj(self.vouchersData, false);
                                    self.orgData = self.vouchersData;
                                    self.loadMasterDetails(self, function () {
                                        self.dataLoad1 = false;
                                    });
                                }
                            }
                        }else{
                            self.vouchersData[voucher.key] = item;
                            process_item++;
                            if(process_item === snap.numChildren()){
                                self.vouchersData = func.sortObj(self.vouchersData, false);
                                self.orgData = self.vouchersData;
                                self.loadMasterDetails(self, function () {
                                    self.dataLoad1 = false;
                                });
                            }
                        }
                    });
                });
            } else {
                self.loadMasterDetails(self, function () {
                    self.dataLoad1 = false;
                });
            }
        });
    },
    data: function(){
        return {
            //loaders
            dataLoad1: true,

            //data
            vouchersData: {},

            // pagination, search
            orgData: {},
            search_txt: '',
            pagData: {},
            maxRows: 20,
            totRows: 0,
            totPages: 1,
            curPage: 1,
            start: 0,

            //references
            projectsRef: null,
            masterDetailsRef: null,
            partyInformationRef: null,
            vouchersRef: null,
            projectTypeItemsRef: null,
            vouchersEntriesRef: null,
        }
    },
    watch: {
        search_txt: function (val) {
            this.search_values(this, val);
        },
        vouchersData: function (val) {
            this.pagination(this, val);
        },
        curPage: function (val) {
            this.start = (val * this.maxRows) - (this.maxRows - 1);
            this.changePage();
        }
    },
    methods: {
        formatDate: function (date) {
            return func.getDate(date);
        },
        active: function (key) {
            let self = this;
            let sel_item = self.vouchersData[key];
            if(sel_item.type === "md"){
                self.masterDetailsRef.child(key).update({
                    posted_status: "Yes"
                }, function(err){
                    if(err){
                        console.log(err);
                    }
                    self.vouchersData[key]['posted_status'] = "Yes";
                });
            }else{
                self.vouchersRef.child(key).update({
                    posted_status: "Yes"
                }, function(err){
                    if(err){
                        console.log(err);
                    }
                    self.vouchersData[key]['posted_status'] = "Yes";
                });
            }
        },
        deactive: function (key) {
            let self = this;
            let sel_item = self.vouchersData[key];
            if(sel_item.type === "md"){
                self.masterDetailsRef.child(key).update({
                    posted_status: "No"
                }, function(err){
                    if(err){
                        console.log(err);
                    }
                    self.vouchersData[key]['posted_status'] = "No";
                });
            }else{
                self.vouchersRef.child(key).update({
                    posted_status: "No"
                }, function(err){
                    if(err){
                        console.log(err);
                    }
                    self.vouchersData[key]['posted_status'] = "No";
                });
            }
        },
        loadMasterDetails: function (self, callback) {
            self.masterDetailsRef.once('value', function (snap) {
                if (snap.numChildren() > 0) {
                    let process_item = 0;
                    snap.forEach(function (mdSnap) {
                        let item = mdSnap.val();
                        self.projectsRef.child(item.sel_project).once("value", function (proSnap) {
                            let proData = proSnap.val();
                            item['project'] = proData.name;
                            item['type'] = "md";
                            item['gen_type'] = "Customer Details";
                            item['gen_date'] = self.formatDate(new Date(item.booking_date));

                            self.projectTypeItemsRef.child(item.sel_pro_type_no).once('value', function (proSelItemSnap) {
                                let data = proSelItemSnap.val();

                                item['ref_gen'] = item.allotee_code+" | "+ item.allotee_name +" | "+data.name;
                                process_item++;
                                self.vouchersData[mdSnap.key] = item;
                                if(process_item === snap.numChildren()){
                                    self.vouchersData = func.sortObj(self.vouchersData);
                                    callback();
                                }
                            });
                        });
                    });
                } else {
                    callback();
                }
            });
        },
        search_values: function (self, val) {
            let saveData = self.orgData;
            if(val !== ""){
                let gen_search_data = {};
                let searchKeys = Object.keys(saveData);
                for(let i=0; i < searchKeys.length; i++){
                    let sKey = searchKeys[i];
                    let sItem = saveData[sKey];

                    val = val.toLowerCase();

                    if((sItem.id).toString().indexOf(val) > -1){
                        gen_search_data[sKey] = sItem;
                        continue;
                    }
                    if(sItem.gen_type.toLowerCase().indexOf(val) > -1){
                        gen_search_data[sKey] = sItem;
                        continue;
                    }
                    if(sItem.ref_gen){
                        if(sItem.ref_gen.toLowerCase().indexOf(val) > -1){
                            gen_search_data[sKey] = sItem;
                            continue;
                        }
                    }
                    if(sItem.project.toLowerCase().indexOf(val) > -1){
                        gen_search_data[sKey] = sItem;
                        continue;
                    }
                    if(sItem.gen_date.indexOf(val) > -1){
                        gen_search_data[sKey] = sItem;
                    }
                }
                self.vouchersData = gen_search_data;
            }else{
                self.vouchersData = func.sortObj(self.orgData);
            }
        },
        pagination: function (self, val) {
            let rKeys = Object.keys(val);
            self.pagData = {};
            self.totRows = rKeys.length;
            self.start = 0;
            let end = Math.min(self.start + self.maxRows, self.totRows);

            self.calculatePagNo(self);

            if(self.totRows > 0){
                for(let i=0; i<end; i++){
                    self.pagData[rKeys[i]] = val[rKeys[i]];
                }
            }
        },
        calculatePagNo: function (self) {
            self.totPages = 1;
            self.curPage = 1;
            if(self.totRows > self.maxRows){
                self.totPages = Math.ceil(self.totRows/self.maxRows);
            }
        },
        nextPage: function () {
            this.curPage += 1;
        },
        prevPage: function () {
            this.curPage -= 1;
        },
        changePage: function () {
            let self = this;
            let rKeys = Object.keys(self.vouchersData);
            self.pagData = {};
            self.totRows = rKeys.length;
            let end = Math.min(self.start + self.maxRows - 1, self.totRows);

            if(self.totRows > 0){
                for(let i=(self.start-1); i<end; i++){
                    self.pagData[rKeys[i]] = self.vouchersData[rKeys[i]];
                }
            }

        }
    }
}