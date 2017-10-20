import firebase from 'firebase'
import bcrypt from 'bcrypt-nodejs'

import SimpleVueValidation from 'simple-vue-validator'
import Promise from 'bluebird'

import comUserCities from '../../../partials/components/get_user_cities/get_user_cities.vue'

const Validator = SimpleVueValidation.Validator;
const saltRounds = 10;

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.usersRef = db.ref('/users');
        self.projectsRef = db.ref('/projects');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });

        self.usersRef.child(self.$route.params.id).once('value', function (userSnap) {
            let renderData = userSnap.val();
            if (renderData !== null) {
                self.dataLoad2 = false;
                self.first_name = renderData.first_name;
                self.last_name = renderData.last_name;
                self.email = renderData.email;
                self.mob_num = renderData.mob_num;
                self.gender = renderData.gender;
                self.sel_project = (renderData.projects === true) ? []: renderData.projects;
                self.zipcode = renderData.zipcode;
                self.pro_sel_type = (renderData.projects === true) ? "All": "Select";
                setTimeout(function () {
                    self.$refs.sel_city.query = renderData.city;
                }, 100);
                self.load_img();
            } else {
                self.$router.push('/create_new_user');
            }
        });

        $(function () {
            $('body').on('change', "#profile_img", function (e) {
                self.fileChange(e);
            });
        });
    },
    data: function () {
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,
            dataLoad2: true,
            fileLoader: false,
            loadImg: true,

            // data save
            proData: {},
            userData: {},

            // references
            projectsRef: null,
            usersRef: null,

            // form fields
            load_src: "",
            profile_img_src: "/assets/images/default-user.png",
            profile_img: null,
            pro_sel_type: "Select",
            first_name: "",
            last_name: "",
            email: "",
            mob_num: "",
            password: "",
            retype_password: "",
            gender: "Male",
            sel_project: [],
            zipcode: "",
            errMain: "",
            sucMain: "",
        }
    },
    watch: {
        profile_img: function (val) {
            let self = this;
            self.profile_img_src = "/assets/images/default-user.png";
            if (val !== null) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    self.profile_img_src = e.target.result;
                };
                reader.readAsDataURL(val);
            }
        },
        load_src: function (val) {
            if(val !== ""){
                this.profile_img_src = val;
            }
        }
    },
    validators: {
        first_name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 35);
        },
        last_name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 35);
        },
        email: function (value) {
            let self = this;
            return Validator.value(value).required().maxLength(50).email().custom(function () {
                return Promise.delay(1000).then(function () {
                    return self.usersRef.orderByChild('email').equalTo(value).once('value').then(function (userSnap) {
                        let userData = userSnap.val();
                        if (userData !== null) {
                            let keys = Object.keys(userData);
                            if(keys[0] !== self.$route.params.id){
                                return "Already taken!";
                            }
                        }
                    });
                });
            });
        },
        mob_num: function (value) {
            let msg = 'Invalid Phone/Mobile Number!';
            return Validator.value(value).required().digit(msg).lengthBetween(11, 11, msg);
        },
        password: function (value) {
            return Validator.value(value).lengthBetween(6, 35);
        },
        'retype_password, password': function (repeat, password) {
            if(password !== ""){
                return Validator.value(repeat).required().match(password);
            }
        },
        gender: function (value) {
            return Validator.value(value).required().in(['Male', 'Female'], "Invalid Gender!");
        },
        sel_project: function (value) {
            let self = this;
            if (self.pro_sel_type === "Select") {
                return Validator.value(value).required();
            }
        },
        zipcode: function (value) {
            let msg = 'Invalid Zip code!';
            return Validator.value(value).required().digit(msg).lengthBetween(6, 6, msg);
        },
    },
    methods: {
        updateUser: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success_form) {
                self.$refs.sel_city.validate(function (success_city) {
                    if (success_form && success_city) {

                        let updateData = {
                            first_name: self.first_name,
                            last_name: self.last_name,
                            email: self.email,
                            mob_num: self.mob_num,
                            gender: self.gender,
                            projects: (self.pro_sel_type === "Select") ? self.sel_project : true,
                            zipcode: self.zipcode,
                            city: self.$refs.sel_city.query,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        };

                        if(self.password !== ""){
                            let salt = bcrypt.genSaltSync(saltRounds);
                            updateData['password'] = bcrypt.hashSync(self.password, salt);
                        }

                        self.usersRef.child(self.$route.params.id).update(updateData, function (err) {
                            if (err) {
                                self.errMain = err.message;
                                self.inProcess = false;
                            } else {
                                if (self.profile_img !== null) {
                                    self.upload_img(self.$route.params.id, function () {
                                        self.succMsg(self);
                                    });
                                }else{
                                    self.succMsg(self);
                                }
                            }
                        });
                    }else{
                        self.inProcess = false;
                    }
                });
            });
        },
        active: function (key) {
            let self = this;
            self.usersRef.child(key).update({act_status: true});
        },
        deactive: function (key) {
            let self = this;
            self.usersRef.child(key).update({act_status: false});
        },
        fileChange: function (event) {
            let self = this;
            self.profile_img = null;
            let input = event.target;
            let grab_files = input.files;
            let ValidImageTypes = ["image/jpeg", "image/png"];
            if (grab_files.length > 0) {
                let grab_1_file = grab_files[0];
                if (ValidImageTypes.indexOf(grab_1_file["type"]) < 0 || grab_1_file["size"] > 2000000) {
                    $(input).replaceWith($(input).val("").clone(true));
                } else {
                    self.profile_img = grab_1_file;
                }
            }
        },
        upload_img: function (id, callback) {
            let self = this;
            let storage = firebase.storage();
            let uploadTask = storage.ref("profile_images/" + id + ".jpg")
                .put(self.profile_img);
            self.fileLoader = true;
            uploadTask.then(function (snap) {
                self.fileLoader = false;
                self.profile_img = null;
                $("#profile_img").replaceWith($("#profile_img").val("").clone(true));
                callback();
            }, function (err) {
                console.log(err.message_);
                self.fileLoader = false;
                self.profile_img = null;
                $("#profile_img").replaceWith($("#profile_img").val("").clone(true));
                callback();
            });
        },
        load_img: function () {
            let self = this;
            if (self.loadImg) {
                const storage = firebase.storage();
                let ref = storage.ref('profile_images/' + self.$route.params.id + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.load_src = url;
                    self.loadImg = false;
                }, function (err) {
                    self.loadImg = false;
                });
            }
        },
        succMsg: function (self) {
            self.inProcess = false;
            self.errMain = "";
            self.sucMain = "Successfully Update User!";

            setTimeout(function () {
                self.sucMain = "";
                self.$router.push('/create_new_user');
            }, 1500);
        }
    },
    components: {
        "com_cities": comUserCities
    }
}