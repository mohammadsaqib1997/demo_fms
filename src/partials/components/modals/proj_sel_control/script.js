import firebase from 'firebase'
import func from '../../../../../custom_libs/func'
import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('debit', function (val, oldVal) {
            self.debit = func.isNumber(val, 8);
        });
        self.$watch('credit', function (val, oldVal) {
            self.credit = func.isNumber(val, 8);
        });

        const db = firebase.database();
        self.controlsRef = db.ref('/controls');
        self.projectsRef = db.ref('/projects');
        self.regControlsRef = db.ref('/reg_controls');

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
            //loaders
            dataLoad1: true,
            dataLoad2: true,
            inProcess: false,

            // db reference
            projectsRef: null,
            controlsRef: null,
            regControlsRef: null,

            // db reference
            projectData: {},
            controlData: {},

            // form fields
            sel_project: "",
            sel_control: "",
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
            let self = this;
            return Validator.value(value).required().lengthBetween(20, 36).custom(function () {
                return Promise.delay(1000).then(function () {
                    if (self.sel_control !== "" && self.sel_project !== "") {
                        return self.regControlsRef
                            .child(self.sel_project)
                            .orderByChild("key")
                            .equalTo(self.sel_control)
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
        addControl: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    self.regControlsRef
                        .child(self.sel_project + "/" + func.genInvoiceNo(self.controlData[self.sel_control].id, "00", 3))
                        .set({
                            'key': self.sel_control,
                            'debit': self.debit,
                            'credit': self.credit,
                            'createdAt': firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                            } else {
                                self.errMain = "";
                                self.sucMain = "Successfully added control in project!";
                                self.sel_project = "";
                                self.sel_control = "";
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