import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import func from '../../../../../custom_libs/func'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_project', function (val, oldVal) {
            self.regSubContGet(val);
        });
        self.$watch('sel_subCont_start', function (val, oldVal) {
            self.validCheck();
        });
        self.$watch('sel_subCont_end', function (val, oldVal) {
            self.validCheck();
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.subContRef = db.ref('/sub_controls');
        self.regSubContRef = db.ref('/reg_sub_controls');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });
    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            dataLoad2: false,
            validForm: false,
            anchURL: '',

            // data save
            proData: {},
            contData: {},
            subContData: [],

            // references
            subContRef: null,
            projectsRef: null,
            regSubContRef: null,

            // form fields
            sel_project: "",
            sel_subCont_start: "",
            sel_subCont_end: "",
        }
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_subCont_start: function (value) {
            return Validator.value(value).required().lengthBetween(3, 11, "Invalid Register Sub Control Id!");
        },
        sel_subCont_end: function (value) {
            return Validator.value(value).required().lengthBetween(3, 11, "Invalid Register Sub Control Id!");
        }
    },
    methods: {
        regSubContGet: function (pro_key) {
            let self = this;
            self.dataLoad2 = true;
            self.sel_subCont_start = "";
            self.sel_subCont_end = "";
            self.subContData = {};
            if (pro_key !== "") {
                func.dbLoadMet(function () {
                    self.regSubContRef.child(pro_key).on('value', function (proSelContSnap) {
                        let data = proSelContSnap.val();
                        if (data !== null) {
                            let ids = Object.keys(data);
                            let ids_length = ids.length;
                            let process_item = 0;
                            self.sel_subCont_start = "";
                            self.sel_subCont_end = "";
                            self.subContData = {};
                            ids.forEach(function (id) {
                                let item = data[id];
                                self.subContRef.child(item.key).once('value').then(function (subContSnap) {
                                    let subContData = subContSnap.val();
                                    subContData['name'] = id + " " + subContData.name;
                                    self.subContData[id] = subContData;
                                    process_item++;
                                    if (process_item === ids_length) {
                                        self.subContData = func.sortObj(self.subContData, false);
                                        self.dataLoad2 = false;
                                    }
                                });
                            });
                        } else {
                            self.dataLoad2 = false;
                        }
                    });
                }, 500, self.dbLoad);
            } else {
                self.dataLoad2 = false;
            }
        },
        validCheck: function () {
            let self = this;
            self.anchURL = '';
            self.$validate().then(function (success) {
                if (success) {
                    self.validForm = true;
                    self.anchURL = '/sheet/sub_control/'+self.sel_project+"/"+self.sel_subCont_start+"/"+self.sel_subCont_end;
                }else{
                    self.validForm = false;
                }
            });
        }
    }
}