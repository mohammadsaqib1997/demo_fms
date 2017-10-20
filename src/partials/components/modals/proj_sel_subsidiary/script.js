import firebase from 'firebase'
import func from '../../../../../custom_libs/func'
import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_control', function (val, oldVal) {
            self.loadSubCont(val);
        });

        self.$watch('sel_sub_control', function (val, oldVal) {
            self.loadSubsidiary(val);
        });

        self.$watch('debit', function (val, oldVal) {
            self.debit = func.isNumber(val, 8);
        });

        self.$watch('credit', function (val, oldVal) {
            self.credit = func.isNumber(val, 8);
        });

        const db = firebase.database();
        self.subsidiaryRef = db.ref('/subsidiary');
        self.subControlsRef = db.ref('/sub_controls');
        self.controlsRef = db.ref('/controls');
        self.projectsRef = db.ref('/projects');
        self.billTypesRef = db.ref('/bill_types');
        self.partyInformationRef = db.ref('/party_information');
        self.regSubsRef = db.ref('/reg_subsidiary');

        self.projectsRef.on('value', function (proSnap) {
            let data = proSnap.val();
            if (data !== null) {
                self.projectData = data;
            } else {
                self.projectData = {};
            }
            self.sel_project = "";
            self.dataLoad1 = false;
        });

        self.controlsRef.on('value', function (contSnap) {
            let data = contSnap.val();
            if (data !== null) {
                self.controlData = data;
            } else {
                self.controlData = {};
            }
            self.sel_control = "";
            self.dataLoad2 = false;
        });

        self.partyInformationRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.partyData = renderData;
            } else {
                self.partyData = {};
            }
            self.dataLoad5 = false;
        });

        self.billTypesRef.on('value', function (billTypesSnap) {
            let renderData = billTypesSnap.val();
            if (renderData !== null) {
                self.billTypesData = renderData;
            }else{
                self.billTypesData = {};
            }
            self.dataLoad6 = false;
        });
    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: false,
            dataLoad4: false,
            dataLoad5: true,
            dataLoad6: true,
            inProcess: false,

            // db reference
            projectsRef: null,
            controlsRef: null,
            subControlsRef: null,
            subsidiaryRef: null,
            billTypesRef: null,
            partyInformationRef: null,
            regSubsRef: null,

            // db reference
            projectData: {},
            controlData: {},
            subControlData: {},
            subsidiaryData: {},
            billTypesData: {},
            partyData: {},

            // form fields
            sel_project: "",
            sel_control: "",
            sel_sub_control: "",
            sel_subsidiary: "",
            party_id: "",
            bill_type: "",
            debit: 0,
            credit: 0,
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_sub_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_subsidiary: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(20, 36).custom(function () {
                return Promise.delay(1000).then(function () {
                    if (self.sel_subsidiary !== "" && self.sel_sub_control !== "" && self.sel_control !== "" && self.sel_project !== "") {
                        return self.regSubsRef
                            .child(self.sel_project /*+ "/" + self.sel_control + "/" + self.sel_sub_control + "/" + self.sel_subsidiary*/)
                            .orderByChild("key")
                            .equalTo(self.sel_subsidiary)
                            .once('value').then(function (snap) {
                                if(snap.val() !== null){
                                    return "Already Selected!";
                                }
                            });
                    }
                });
            });
        },
        party_id: function (value) {
            return Validator.value(value).lengthBetween(20, 36);
        },
        bill_type: function (value) {
            return Validator.value(value).required().lengthBetween(1, 11, "Invalid Bill Type!");
        },
    },
    methods: {
        loadSubCont: function (cont_key) {
            let self = this;
            self.dataLoad3 = true;
            self.sel_sub_control = "";
            self.subControlData = {};
            if(cont_key !== ""){
                self.subControlsRef.orderByChild('cont_key').equalTo(cont_key).on('value', function (subContSnap) {
                    let data = subContSnap.val();
                    if (data !== null) {
                        self.subControlData = data;
                    }else{
                        self.subControlData = {};
                    }
                    self.dataLoad3 = false;
                });
            }else{
                self.dataLoad3 = false;
            }
        },
        loadSubsidiary: function (sub_cont_key) {
            let self = this;
            self.dataLoad4 = true;
            self.sel_subsidiary = "";
            self.subsidiaryData = {};
            if(sub_cont_key !== ""){
                self.subsidiaryRef.orderByChild('sub_cont_key').equalTo(sub_cont_key).on('value', function (subsSnap) {
                    let data = subsSnap.val();
                    if (data !== null) {
                        self.subsidiaryData = data;
                    }
                    self.dataLoad4 = false;
                });
            }else{
                self.dataLoad4 = false;
            }
        },
        addRegSubs: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    let id_gen = func.genInvoiceNo(self.controlData[self.sel_control].id, '00', 3)
                        +func.genInvoiceNo(self.subControlData[self.sel_sub_control].id, '000', 4)
                        +func.genInvoiceNo(self.subsidiaryData[self.sel_subsidiary].id, '00', 3);
                    self.regSubsRef
                        .child(self.sel_project+"/"+id_gen /*+ "/" + self.sel_control + "/" + self.sel_sub_control + "/" + self.sel_subsidiary*/)
                        .set({
                            'key': self.sel_subsidiary,
                            'sub_cont_key': self.sel_sub_control,
                            'debit': self.debit,
                            'credit': self.credit,
                            'party_key': (self.party_id !== "")? self.party_id: false,
                            'bill_type_key': self.bill_type,
                            'createdAt': firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                            } else {
                                self.errMain = "";
                                self.sucMain = "Successfully added subsidiary in project!";
                                self.sel_project = "";
                                self.sel_control = "";
                                self.sel_sub_control = "";
                                self.sel_subsidiary = "";
                                self.party_id = "";
                                self.bill_type = "";
                                self.credit = 0;
                                self.debit = 0;
                                self.validation.reset();
                                setTimeout(function () {
                                    self.sucMain = "";
                                }, 1500);
                            }
                            self.inProcess = false;
                        });
                }else{
                    self.inProcess = false;
                }
            });
        }
    }
}