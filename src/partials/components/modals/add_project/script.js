import firebase from 'firebase'
import func from '../../../../../custom_libs/func'
import Promise from 'bluebird'
import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    props: ["sel_project"],
    created: function () {
        let self = this;

        self.$watch('name', function (val, oldVal) {
            self.name = func.trim(val);
        });
        self.$watch('address', function (val, oldVal) {
            self.address = func.trim(val);
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.typesRef = db.ref('/project_types');

        self.typesRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.typesData = renderData;
            } else {
                self.typesData = {};
            }
            self.dataLoad1 = false;
        });
    },
    watch: {
        sel_project: function (val) {
            this.loadProject(val);
        }
    },
    data: function () {
        return {
            //loaders
            dataLoad: false,
            dataLoad1: true,
            inProcess: false,

            // data save
            typesData: {},

            // references
            typesRef: null,
            projectsRef: null,

            // form fields
            name: "",
            type: "",
            address: "",
            contactNo: "",
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        name: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(6, 40).custom(function () {
                return Promise.delay(1000).then(function () {
                    return self.projectsRef.orderByChild('name').equalTo(value).once('value').then(function (proSnap) {
                        let proData = proSnap.val();
                        if (proData !== null) {
                            if (self.sel_project !== "") {
                                let keys = Object.keys(proData);
                                if (self.sel_project !== keys[0]) {
                                    return "Already taken!";
                                }
                            } else {
                                return "Already taken!";
                            }
                        }
                    });
                });
            });
        },
        type: function (value) {
            return Validator.value(value).required().digit().maxLength(11);
        },
        address: function (value) {
            return Validator.value(value).required().maxLength(100);
        },
        contactNo: function (value) {
            return Validator.value(value).required().digit().lengthBetween(11, 11, "Invalid Number!");
        },
    },
    methods: {
        addProject: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    if (typeof self.sel_project !== "undefined" && self.sel_project !== "") {
                        self.projectsRef.child(self.sel_project).update({
                            name: self.name,
                            pro_type_id: self.type,
                            address: self.address,
                            contactNo: self.contactNo,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                            } else {
                                self.errMain = "";
                                self.sucMain = "Successfully Updated project!";
                                setTimeout(function () {
                                    self.sucMain = "";
                                }, 1500);
                            }
                            self.inProcess = false;
                        });
                    } else {
                        self.projectsRef.orderByChild('id').limitToLast(1).once('value').then(function (projSnap) {
                            let projData = projSnap.val();
                            let next_id = 1;
                            if (projData !== null) {
                                let keys = Object.keys(projData);
                                next_id = parseInt(projData[keys[0]].id) + 1;
                            }
                            self.projectsRef.push({
                                id: next_id,
                                name: self.name,
                                pro_type_id: self.type,
                                address: self.address,
                                contactNo: self.contactNo,
                                createdAt: firebase.database.ServerValue.TIMESTAMP
                            }, function (err) {
                                if (err) {
                                    self.errMain = err.message;
                                } else {
                                    self.errMain = "";
                                    self.sucMain = "Successfully inserted project!";
                                    self.name = "";
                                    self.type = "";
                                    self.address = "";
                                    self.contactNo = "";
                                    self.validation.reset();
                                    setTimeout(function () {
                                        self.sucMain = "";
                                    }, 1500);
                                }
                                self.inProcess = false;
                            })
                        });
                    }
                } else {
                    self.inProcess = false;
                }
            });
        },
        loadProject: function (val) {
            let self = this;
            if (val !== "") {
                self.dataLoad = true;
                self.projectsRef.child(val).once('value', function (snap) {
                    self.dataLoad = false;
                    let data = snap.val();
                    self.name = data.name;
                    self.type = data.pro_type_id;
                    self.address = data.address;
                    self.contactNo = data.contactNo;
                });
            } else {
                self.name = "";
                self.type = "";
                self.address = "";
                self.contactNo = "";
                self.validation.reset();
            }
        }
    }
}