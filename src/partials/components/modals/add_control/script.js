import firebase from 'firebase'

import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('cont_name', function (val, oldVal) {
            self.cont_name = self.$root.trim(val);
        });

        const db = firebase.database();
        self.controlsRef = db.ref('/controls');
    },
    data: function () {
        return {
            //loaders
            inProcess: false,

            controlsRef: null,

            // form fields
            cont_name: "",
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        cont_name: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(3, 40).custom(function () {
                return Promise.delay(1000).then(function () {
                    return self.controlsRef.orderByChild('name').equalTo(value).once('value').then(function (contSnap) {
                        let contData = contSnap.val();
                        if(contData !== null){
                            return "Already taken!";
                        }
                    });
                });
            });
        }
    },
    methods: {
        addControl: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    self.inProcess = true;
                    self.controlsRef
                        .orderByChild('id')
                        .limitToLast(1)
                        .once('value')
                        .then(function (controlsSnap) {
                            let controlsData = controlsSnap.val();
                            let next_id = 1;
                            if (controlsData !== null) {
                                let keys = Object.keys(controlsData);
                                next_id = parseInt(controlsData[keys[0]].id) + 1;
                            }
                            self.controlsRef.push({
                                id: next_id,
                                name: self.cont_name,
                            }, function (err) {
                                if (err) {
                                    self.errMain = err.message;
                                } else {
                                    self.errMain = "";
                                    self.sucMain = "Successfully inserted control!";
                                    self.cont_name = "";
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