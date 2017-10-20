import firebase from 'firebase'
import func from '../../../../../custom_libs/func'
import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_control', function (val, oldVal) {
            self.contSelSubCont(val);
        });
        self.$watch('sub_cont_name', function (val, oldVal) {
            self.sub_cont_name = func.trim(val);
        });

        const db = firebase.database();
        self.controlsRef = db.ref('/controls');
        self.subControlsRef = db.ref('/sub_controls');
        self.subsidiaryRef = db.ref('/subsidiary');

        self.controlsRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.controlData = renderData;
            } else {
                self.controlData = {};
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
            inProcess: false,

            // data save
            controlData: {},
            subControlData: {},

            // references
            controlsRef: null,
            subControlsRef: null,
            subsidiaryRef: null,

            // form fields
            sel_control: "",
            sel_sub_control: "",
            subsidiary_name: "",
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        sel_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_sub_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        subsidiary_name: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(3, 40).custom(function () {
                return Promise.delay(1000).then(function () {
                    if(self.sel_control !== ""){
                        return self.subsidiaryRef.orderByChild('name').equalTo(value).once('value').then(function (subsSnap) {
                            let subsData = subsSnap.val();
                            if(subsData !== null){
                                return "Already taken!";
                            }
                        });
                    }
                });
            });
        }
    },
    methods: {
        contSelSubCont: function (cont_key) {
            let self = this;
            self.dataLoad2 = true;
            self.sel_sub_control = "";
            self.subControlData = {};
            if(cont_key !== ""){
                func.dbLoadMet(function () {
                    self.subControlsRef.orderByChild('cont_key').equalTo(cont_key).on('value', function (subContSnap) {
                        let data = subContSnap.val();
                        if(data !== null){
                            self.subControlData = data;
                        }
                        self.dataLoad2 = false;
                    });
                }, 500, self.dbLoad);
            }else{
                self.dataLoad2 = false;
            }
        },
        addSubsidiary: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    self.inProcess = true;
                    self.subsidiaryRef
                        .orderByChild('sub_cont_key')
                        .equalTo(self.sel_sub_control)
                        .limitToLast(1)
                        .once('value')
                        .then(function (subsSnap) {
                            let subsData = subsSnap.val();
                            let next_id = 1;
                            if(subsData !== null){
                                let keys = Object.keys(subsData);
                                next_id = parseInt(subsData[keys[keys.length-1]].id)+1;
                            }
                            self.inProcess = false;
                            self.subsidiaryRef.push({
                                id: next_id,
                                name: self.subsidiary_name,
                                sub_cont_key: self.sel_sub_control
                            }, function (err) {
                                if(err){
                                    self.errMain = err.message;
                                }else{
                                    self.errMain = "";
                                    self.sucMain = "Successfully inserted sub control!";
                                    self.sel_control = "";
                                    self.sel_sub_control = "";
                                    self.subsidiary_name = "";
                                    self.validation.reset();
                                    setTimeout(function () {
                                        self.sucMain = "";
                                    }, 1500);
                                }
                                self.inProcess = false;
                            });
                        });
                }
            });
        }
    }
}