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

        self.$watch('debit', function (val, oldVal) {
            self.debit = func.isNumber(val, 8);
        });
        self.$watch('credit', function (val, oldVal) {
            self.credit = func.isNumber(val, 8);
        });

        const db = firebase.database();
        self.subControlsRef = db.ref('/sub_controls');
        self.controlsRef = db.ref('/controls');
        self.projectsRef = db.ref('/projects');
        self.regSubControlsRef = db.ref('/reg_sub_controls');

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
    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: false,
            inProcess: false,

            // db reference
            projectsRef: null,
            controlsRef: null,
            subControlsRef: null,
            regSubControlsRef: null,

            // db reference
            projectData: {},
            controlData: {},
            subControlData: {},

            // form fields
            sel_project: "",
            sel_control: "",
            sel_sub_control: "",
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
            let self = this;
            return Validator.value(value).required().lengthBetween(20, 36).custom(function () {
                return Promise.delay(1000).then(function () {
                    if (self.sel_sub_control !== "" && self.sel_control !== "" && self.sel_project !== "") {
                        return self.regSubControlsRef
                            .child(self.sel_project/* + "/" + self.sel_control + "/" + self.sel_sub_control*/)
                            .orderByChild("key")
                            .equalTo(self.sel_sub_control)
                            .once('value').then(function (snap) {
                                if(snap.val() !== null){
                                    return "Already Selected!";
                                }
                            });
                    }
                });
            });
        }
    },
    methods: {
        loadSubCont: function (cont_key) {
            let self = this;
            self.sel_sub_control = "";
            self.subControlData = {};
            if(cont_key !== ""){
                self.dataLoad3 = true;
                self.subControlsRef.orderByChild('cont_key').equalTo(cont_key).on('value', function (subContSnap) {
                    let data = subContSnap.val();
                    if (data !== null) {
                        self.subControlData = data;
                    }
                    self.dataLoad3 = false;
                });
            }
        },
        addRegSubCont: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    let id_gen = func.genInvoiceNo(self.controlData[self.sel_control].id, '00', 3)+func.genInvoiceNo(self.subControlData[self.sel_sub_control].id, '000', 4);
                    self.regSubControlsRef
                        .child(self.sel_project+"/"+id_gen)
                        .set({
                            'key': self.sel_sub_control,
                            'cont_key': self.sel_control,
                            'debit': self.debit,
                            'credit': self.credit,
                            'createdAt': firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                            } else {
                                self.errMain = "";
                                self.sucMain = "Successfully added sub control in project!";
                                self.sel_project = "";
                                self.sel_control = "";
                                self.sel_sub_control = "";
                                self.debit = 0;
                                self.credit = 0;
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