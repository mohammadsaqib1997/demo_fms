import firebase from 'firebase'

import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.projectTypesRef = db.ref('/project_types');
        self.projectTypeItemsRef = db.ref('/project_type_items');
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.subsidiaryRef = db.ref('/subsidiary');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });

        self.projectTypesRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.proTypesData = renderData;
            } else {
                self.proTypesData = {};
            }
            self.dataLoad2 = false;
        });
    },
    data: function () {
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: false,

            //data
            proData: {},
            proTypesData: {},
            regSubsData: {},

            //reference
            projectsRef: null,
            projectTypesRef: null,
            projectTypeItemsRef: null,
            regSubsidiaryRef: null,

            // form fields
            name: "",
            sel_subs: "",
            sel_project: "",
            sel_type: "",
            errMain: "",
            sucMain: "",
        }
    },
    watch: {
        sel_project: function (val) {
            let self = this;
            if(val !== ""){
                self.sel_type = self.proData[val].pro_type_id;
            }else{
                self.sel_type = "";
            }
            this.loadSubsidiary(val);
        }
    },
    validators: {
        name: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(3, 50).custom(function () {
                if(value !== ""){
                    return Promise.delay(1000).then(function () {
                        return self.projectTypeItemsRef.orderByChild('name').equalTo(value).once('value').then(function (snap) {
                            let data = snap.val();
                            if(data !== null){
                                let keys = Object.keys(data);
                                let exist = false;
                                keys.forEach(function (key) {
                                    let item = data[key];
                                    if(item.pro_key === self.sel_project){
                                        exist = true;
                                        return false;
                                    }
                                });
                                if(exist){
                                    return "Already taken!";
                                }
                            }
                        });
                    });
                }
            });
        },
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_subs: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(20, 36).custom(function () {
                if(value !== ""){
                    return Promise.delay(1000).then(function () {
                        return self.projectTypeItemsRef.orderByChild('subs_key').equalTo(value).once('value').then(function (snap) {
                            let data = snap.val();
                            if(data !== null){
                                let keys = Object.keys(data);
                                let exist = false;
                                keys.forEach(function (key) {
                                    let item = data[key];
                                    if(item.pro_key === self.sel_project){
                                        exist = true;
                                        return false;
                                    }
                                });
                                if(exist){
                                    return "Already taken!";
                                }
                            }
                        });
                    });
                }
            });
        },
        sel_type: function (value) {
            return Validator.value(value).required().lengthBetween(1, 11);
        },
    },
    methods: {
        addTypeItem: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    self.projectTypeItemsRef
                        .orderByChild('id')
                        .limitToLast(1)
                        .once('value')
                        .then(function (snap) {
                            let renderData = snap.val();
                            let next_id = 1;
                            if (renderData !== null) {
                                let keys = Object.keys(renderData);
                                next_id = parseInt(renderData[keys[0]].id) + 1;
                            }
                            self.projectTypeItemsRef.push({
                                id: next_id,
                                name: self.name,
                                pro_key: self.sel_project,
                                type_key: self.sel_type,
                                subs_key: self.sel_subs,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                            }, function (err) {
                                if (err) {
                                    self.errMain = err.message;
                                } else {
                                    self.errMain = "";
                                    self.sucMain = "Successfully inserted item!";
                                    self.name = "";
                                    self.sel_project = "";
                                    self.sel_type = "";
                                    self.validation.reset();
                                    setTimeout(function () {
                                        self.sucMain = "";
                                    }, 1500);
                                }
                                self.inProcess = false;
                            });
                        });
                }else{
                    self.inProcess = false;
                }
            });
        },
        loadSubsidiary: function (val) {
            let self = this;
            self.sel_subs = "";
            if(val !== ""){
                self.dataLoad3 = true;
                self.regSubsidiaryRef.child(val).once('value', function (regSubsSnap) {
                    if(regSubsSnap.numChildren() > 0){
                        let grabData = {};
                        let process_item = 0;
                        regSubsSnap.forEach(function (regSubSnap) {
                            let regSubItem = regSubSnap.val();
                            self.subsidiaryRef.child(regSubItem.key).once('value', function (subsSnap) {
                                let subsData = subsSnap.val();
                                regSubItem['name'] = subsData.name;
                                grabData[subsSnap.key] = regSubItem;

                                process_item++;
                                if(process_item === regSubsSnap.numChildren()){
                                    self.regSubsData = grabData;
                                }
                            });
                        });
                    }else{
                        self.regSubsData = {};
                    }
                    self.dataLoad3 = false;
                });
            }else{
                self.regSubsData = {}
            }
        }
    }
}