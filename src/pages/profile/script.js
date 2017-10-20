import firebase from 'firebase'
import bcrypt from 'bcrypt-nodejs'

import SimpleVueValidation from 'simple-vue-validator'
import Promise from 'bluebird'

import comCities from '../../partials/components/get_cities/get_cities.vue'

const Validator = SimpleVueValidation.Validator;
const saltRounds = 10;

export default {
    created: function () {
        let self = this;

        self.$watch("edit.city", function (val, oldVal) {
            if(val){
                setTimeout(function () {
                    self.$refs.sel_city.query = self.city;
                }, 100);
            }
        });

        setTimeout(function () {
            if(self.$root.loginUID !== ""){
                self.loadData(self.$root.loginUID);
            }
            self.$watch(function () {
                return self.$root.loginUID;
            }, function (val, oldVal) {
                self.loadData(val);
            });
        }, 100);

        const db = firebase.database();
        self.usersRef = db.ref('/users');
        self.projectsRef = db.ref('/projects');

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
            dataLoad1: false,
            dataLoad2: true,
            fileLoader: false,
            loadImg: true,

            // data save
            proData: [],

            // references
            projectsRef: null,
            usersRef: null,

            //edit data conditions
            edit: {
                first_name: false,
                last_name: false,
                mob_num: false,
                gender: false,
                city: false,
                zipcode: false,
                password: false,
            },
            edit_val: {
                first_name: "",
                last_name: "",
                mob_num: "",
                gender: "",
                zipcode: "",
                password: "",
                re_password: "",
            },

            // form fields
            load_src: "",
            profile_img_src: "/assets/images/default-user.png",
            profile_img: null,
            first_name: "",
            last_name: "",
            email: "",
            mob_num: "",
            gender: "Male",
            sel_project: [],
            city: "",
            zipcode: "",
            type: "",
            errMain: "",
            sucMain: "",
        }
    },
    watch: {
        profile_img: function (val) {
            let self = this;
            self.profile_img_src = (self.load_src !== "") ? self.load_src:"/assets/images/default-user.png";
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
        },
        sel_project: function (val) {
            if(val.length > 0){
                this.loadProjects(val);
            }
        },
    },
    validators: {
        "edit_val.first_name": function (value) {
            if(this.edit.first_name){
                return Validator.value(value).required().lengthBetween(3, 35);
            }
        },
        "edit_val.last_name": function (value) {
            if(this.edit.last_name){
                return Validator.value(value).required().lengthBetween(3, 35);
            }
        },
        "edit_val.mob_num": function (value) {
            if(this.edit.mob_num) {
                let msg = 'Invalid Phone/Mobile Number!';
                return Validator.value(value).required().digit(msg).lengthBetween(11, 11, msg);
            }
        },
        "edit_val.gender": function (value) {
            if(this.edit.gender) {
                return Validator.value(value).required().in(['Male', 'Female'], "Invalid Gender!");
            }
        },
        "edit_val.zipcode": function (value) {
            if(this.edit.zipcode){
                let msg = 'Invalid Zip code!';
                return Validator.value(value).required().digit(msg).lengthBetween(6, 6, msg);
            }
        },
        "edit_val.password": function (value) {
            if(this.edit.password){
                return Validator.value(value).required().lengthBetween(6, 35);
            }

        },
        'edit_val.re_password, edit_val.password': function (repeat, password) {
            if(this.edit.password){
                return Validator.value(repeat).required().match(password);
            }
        }
    },
    methods: {
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
        reset_file_input: function () {
            this.profile_img = null;
            $("#profile_img").replaceWith($("#profile_img").val("").clone(true));
        },
        upload_img: function () {
            let self = this;
            if(self.profile_img !== null){
                let storage = firebase.storage();
                let uploadTask = storage.ref("profile_images/" + self.$root.loginUID + ".jpg")
                    .put(self.profile_img);
                self.fileLoader = true;
                uploadTask.then(function (snap) {
                    self.fileLoader = false;
                    self.profile_img = null;
                    self.load_src = snap.downloadURL;
                    self.$root.loadImgSrc = snap.downloadURL;
                    $("#profile_img").replaceWith($("#profile_img").val("").clone(true));
                }, function (err) {
                    console.log(err.message_);
                    self.fileLoader = false;
                    self.profile_img = null;
                    $("#profile_img").replaceWith($("#profile_img").val("").clone(true));
                });
            }
        },
        load_img: function (uid) {
            let self = this;
            if (self.loadImg) {
                const storage = firebase.storage();
                let ref = storage.ref('profile_images/' + uid + '.jpg');
                ref.getDownloadURL().then(function (url) {
                    self.load_src = url;
                    self.loadImg = false;
                }, function (err) {
                    self.loadImg = false;
                });
            }
        },
        succMsg: function (self, field) {
            self.inProcess = false;
            self.errMain = "";
            self.sucMain = "Successfully Update User!";

            self.edit[field] = false;
            self.edit_val[field] = "";
            if(field === "password"){
                self.edit_val['re_password'] = "";
            }

            setTimeout(function () {
                self.sucMain = "";
            }, 1500);
        },
        simEdit: function(field){
            let self = this;
            self.edit[field] = true;
            self.edit_val[field] = (self[field]) ? self[field]: "";
        },
        cancel: function (field) {
            let self = this;
            self.edit[field] = false;
        },
        submit: function (field) {
            let self = this;
            self.inProcess = true;
            if(field === "city"){
                self.$refs.sel_city.validate(function (success_city){
                    if(success_city){
                        let insert = {};
                        insert[field] = self.$refs.sel_city.query;
                        self.usersRef.child(self.$root.loginUID).update(insert, function (err) {
                            if (err) {
                                self.errMain = err.message;
                                self.inProcess = false;
                            } else {
                                self.succMsg(self, field);
                            }
                        });
                    }else{
                        self.inProcess = false;
                    }
                });
            }else{
                self.$validate().then(function(valid){
                    if(valid){
                        if(self.type === "admin" && field === "password"){
                            firebase.auth().currentUser.updatePassword(self.edit_val[field]).then(function () {
                                self.succMsg(self, field);
                            }).catch(function (err) {
                                self.errMain = err.message;
                                self.inProcess = false;
                            });
                        }else{
                            let insert = {};
                            if(field === "password"){
                                let salt = bcrypt.genSaltSync(saltRounds);
                                insert[field] = bcrypt.hashSync(self.edit_val[field], salt);
                            }else{
                                insert[field] = self.edit_val[field];
                            }

                            self.usersRef.child(self.$root.loginUID).update(insert, function (err) {
                                if (err) {
                                    self.errMain = err.message;
                                    self.inProcess = false;
                                } else {
                                    self.succMsg(self, field);
                                }
                            });
                        }
                    }else{
                        self.inProcess = false;
                    }
                });
            }
        },
        loadData: function (uid) {
            let self = this;
            self.usersRef.child(uid).on('value', function (userSnap) {
                let renderData = userSnap.val();
                if (renderData !== null) {
                    self.first_name = renderData.first_name;
                    self.last_name = renderData.last_name;
                    self.email = renderData.email;
                    self.mob_num = (renderData.mob_num) ? renderData.mob_num: "";
                    self.gender = (renderData.gender) ? renderData.gender: "";
                    self.sel_project = (!renderData.projects) ? [] : (renderData.projects === true) ? [] : renderData.projects;
                    self.zipcode = renderData.zipcode;
                    self.city = (renderData.city) ? renderData.city: "";
                    self.type = renderData.type;
                    self.load_img(uid);
                    self.dataLoad2 = false;
                } else {
                    self.$router.push('/create_new_user');
                }
            });
        },
        loadProjects: function (keys) {
            let self = this;
            self.dataLoad1 = true;
            self.proData = [];
            let process_item = 0;
            keys.forEach(function (key) {
                self.projectsRef.child(key).once('value', function (proSnap) {
                    let renderData = proSnap.val();
                    if (renderData !== null) {
                        renderData["key"] = key;
                        self.proData.push(renderData);
                    }
                    process_item++;
                    if(keys.length === process_item){
                        self.dataLoad1 = false;
                    }
                });
            });
        },
        getPro: function () {
            let self = this;
            let names = [];
            if(self.proData.length > 0){
                self.proData.forEach(function (row) {
                    names.push(row.name);
                });
            }
            if(names.length > 0){
                return names.join(", ");
            }else{
                return "All Projects";
            }
        }
    },
    components: {
        "com_cities": comCities
    }
}