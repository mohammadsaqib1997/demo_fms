import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import func from '../../../../../custom_libs/func'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_project', function (val, oldVal) {
            self.proSelContGet(val);
        });
        self.$watch('sel_control_start', function (val, oldVal) {
            self.validCheck();
        });
        self.$watch('sel_control_end', function (val, oldVal) {
            self.validCheck();
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.controlsRef = db.ref('/controls');
        self.regControlsRef = db.ref('/reg_controls');
        self.proSelContRef = db.ref('/pro_sel_control');

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
            controlData: {},

            // references
            regControlsRef: null,
            controlsRef: null,
            projectsRef: null,
            proSelContRef: null,

            // form fields
            sel_project: "",
            sel_control_start: "",
            sel_control_end: "",
        }
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_control_start: function (value) {
            return Validator.value(value).required().lengthBetween(3, 11, "Invalid Register Control Id!");
        },
        sel_control_end: function (value) {
            return Validator.value(value).required().lengthBetween(3, 11, "Invalid Register Control Id!");
        }
    },
    methods: {
        proSelContGet: function (pro_key) {
            let self = this;
            self.dataLoad2 = true;
            self.sel_control_start = "";
            self.sel_control_end = "";
            self.controlData = {};
            if (pro_key !== "") {
                func.dbLoadMet(function () {
                    self.regControlsRef.child(pro_key).on('value', function (regContSnap) {
                        let data = regContSnap.val();
                        if (data !== null) {
                            let keys = Object.keys(data);
                            let keys_length = keys.length;
                            let process_item = 0;
                            self.sel_control_start = "";
                            self.sel_control_end = "";
                            self.controlData = {};
                            keys.forEach(function (row) {
                                let item = data[row];
                                self.controlsRef.child(item.key).once('value').then(function (contSnap) {
                                    let contData = contSnap.val();
                                    contData['name'] = row + " " + contData.name;
                                    self.controlData[row] = contData;
                                    process_item++;
                                    if (process_item === keys_length) {
                                        self.controlData = func.sortObj(self.controlData, false);
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
                    self.anchURL = '/sheet/control/'+self.sel_project+"/"+self.sel_control_start+"/"+self.sel_control_end;
                }else{
                    self.validForm = false;
                }
            });
        }
    }
}