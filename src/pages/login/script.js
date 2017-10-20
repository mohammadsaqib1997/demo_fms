import firebase from 'firebase'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

const admin_email = require('../../../config/client_private.json').admin_email;

export default {
    created: function () {
        setTimeout(function () {
            $('[data-toggle="tooltip"]').tooltip();
        }, 100);
        jQuery.fn.center = function (e) {

            var devtop = ($(window).height() - $(this).outerHeight()) / 2;

            var devleft = ($(window).width() - $(this).outerWidth()) / 2;

            jQuery(this).css({
                position: 'absolute',
                margin: 0,
                top: (devtop > 0 ? devtop : 0) + 'px',
                left: (devleft > 0 ? devleft : 0) + 'px'
            });
        };
        jQuery('.box-login').center();
    },
    data: function () {
        return {
            mainErr: '',
            frgErr: '',
            frgMsg: '',
            frg_edit: false,
            frg_email: "",
            email: '',
            password: '',
            frgProcess: false,
            isProcess: false
        }
    },
    validators: {
        email: function (value) {
            if(!this.frg_edit){
                return Validator.value(value).required().email();
            }
        },
        password: function (value) {
            if(!this.frg_edit){
                return Validator.value(value).required().minLength(6).maxLength(35);
            }
        },
        frg_email: function (value) {
            if(this.frg_edit){
                return Validator.value(value).required().email().maxLength(150);
            }
        }
    },
    methods: {
        login: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    self.isProcess = true;
                    self.mainErr = "";
                    if (self.email === admin_email) {
                        firebase.auth().signInWithEmailAndPassword(self.email, self.password).then(function () {
                            $("#page-load").css({"display": "block"});
                            self.isProcess = false;
                            self.$root.userLoginEmit = true;
                            self.$root.userSaveLS(self.email, self.password, firebase.auth().currentUser.uid);
                            self.$router.push('/');
                        }).catch(function (err) {
                            self.isProcess = false;
                            self.mainErr = err.message;
                        });
                    } else {
                        self.$http.post('/api/check_user', {
                            email: self.email,
                            password: self.password,
                        }).then(function (res) {
                            let body = res.body;
                            if (body.status === "ok") {
                                firebase.auth().signInWithCustomToken(body.token).then(function () {
                                    $("#page-load").css({"display": "block"});
                                    self.isProcess = false;
                                    self.$root.userLoginEmit = true;
                                    self.$root.userSaveLS(self.email, self.password, firebase.auth().currentUser.uid);
                                    self.$router.push('/');
                                }, function (err) {
                                    self.mainErr = err.message;
                                    self.isProcess = false;
                                });
                            } else {
                                self.isProcess = false;
                                self.mainErr = body.message;
                            }
                        }, function (err) {
                            self.isProcess = false;
                            console.log(err);
                        });
                    }
                }
            });
        },
        backtologin: function () {
            this.resetForms(!this.frg_edit);
            $('.main-login .box-login, .main-login .box-forgot').toggle();
        },
        forgot_pass: function () {
            let self = this;
            self.frgProcess = true;
            self.$validate().then(function (success) {
                if(success){
                    self.$http.post('/api/send_mail', {
                        email: self.frg_email,
                    }).then(function (res) {
                        let body = res.body;
                        if (body.status === "ok") {
                            self.resetForms(true);
                            self.frgMsg = "Successfully Email Send!";
                        } else {
                            self.frgErr = body.message;
                        }
                        self.frgProcess = false;
                    }, function (err) {
                        console.log(err);
                        self.frgProcess = false;
                    });
                }else{
                    self.frgProcess = false;
                }
            });

        },
        resetForms: function (boolean) {
            this.frg_edit = boolean;
            this.frg_email = "";
            this.email = "";
            this.password = "";
            this.mainErr = "";
            this.frgErr = "";
            this.frgMsg = "";
            this.validation.reset();
        }
    }
}