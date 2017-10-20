import firebase from 'firebase'

import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.brokersRef = db.ref('/brokers');
    },
    data: function () {
        return {
            //loaders
            inProcess: false,

            brokersRef: null,

            // form fields
            name: "",
            email: "",
            cont_number: "",
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 50);
        },
        email: function (value) {
            let self = this;
            return Validator.value(value).required().email().maxLength(150).custom(function () {
                if(value !== ""){
                    return Promise.delay(1000).then(function () {
                        return self.brokersRef.orderByChild('email').equalTo(value).once('value').then(function (snap) {
                            let data = snap.val();
                            if(data !== null){
                                return "Already taken!";
                            }
                        });
                    });
                }
            });
        },
        cont_number: function (value) {
            let self = this;
            let msg = 'Invalid Contact Number!';
            return Validator.value(value).required().digit(msg).lengthBetween(11, 11, msg).custom(function () {
                if(value !== ""){
                    return Promise.delay(1000).then(function () {
                        return self.brokersRef.orderByChild('contact_num').equalTo(value).once('value').then(function (snap) {
                            let data = snap.val();
                            if(data !== null){
                                return "Already taken!";
                            }
                        });
                    });
                }
            });
        }
    },
    methods: {
        addBroker: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    self.brokersRef
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
                            self.brokersRef.push({
                                id: next_id,
                                name: self.name,
                                email: self.email,
                                contact_num: self.cont_number,
                                createdAt: firebase.database.ServerValue.TIMESTAMP,
                            }, function (err) {
                                if (err) {
                                    self.errMain = err.message;
                                } else {
                                    self.errMain = "";
                                    self.sucMain = "Successfully inserted broker!";
                                    self.name = "";
                                    self.email = "";
                                    self.cont_number = "";
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
        }
    }
}