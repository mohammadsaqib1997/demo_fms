import firebase from 'firebase'

import SimpleVueValidation from 'simple-vue-validator'
import Promise from 'bluebird'

import comCities from '../../partials/components/get_cities/get_cities.vue'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch("sel_party", function (val, oldVal) {
            self.voucherUpdateValues(self, val);
        });

        const db = firebase.database();
        self.partyInformationRef = db.ref('/party_information');
        self.partyInfoCatRef = db.ref('/party_info_cat');

        self.partyInformationRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.partyData = renderData;
            } else {
                self.partyData = {};
            }
            self.dataLoad2 = false;
        });

        self.partyInfoCatRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.pCatData = renderData;
            } else {
                self.pCatData = {};
            }
            self.dataLoad1 = false;
        });

    },
    data: function(){
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,
            dataLoad2: true,
            updateP: false,

            // data save
            partyData: {},
            pCatData: {},

            // references
            partyInformationRef: null,
            partyInfoCatRef: null,

            // form fields
            sel_party: "",

            errMain: "",
            sucMain: "",
            contact_name: "",
            agent_code: "",
            agent_name: "",
            address: "",
            sel_category: "",
            group_code: "",
            phone_num: "",
            fax_num: "",
            email: "",
            nic_num: "",
            ntn_num: "",
            gst_num: "",
            cr_day: "",
            cr_limit: "",
        }
    },
    validators: {
        contact_name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 50);
        },
        agent_code: function (value) {
            return Validator.value(value).digit().maxLength(11);
        },
        agent_name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 50);
        },
        address: function (value) {
            return Validator.value(value).required().lengthBetween(6, 200);
        },
        sel_category: function (value) {
            return Validator.value(value).required().digit().maxLength(11);
        },
        group_code: function (value) {
            return Validator.value(value).digit().maxLength(20);
        },
        phone_num: function (value) {
            return Validator.value(value).required().digit().lengthBetween(11, 11);
        },
        fax_num: function (value) {
            return Validator.value(value).digit().maxLength(13);
        },
        email: function (value) {
            let self = this;
            return Validator.value(value).required().maxLength(50).email().custom(function () {
                if(value !== ""){
                    return Promise.delay(1000).then(function () {
                        return self.partyInformationRef.orderByChild('email').equalTo(value).once('value').then(function (snap) {
                            let data = snap.val();
                            if(data !== null){
                                if(self.updateP){
                                    let keys = Object.keys(data);
                                    if (keys[0] !== self.sel_party) {
                                        return "Already taken!";
                                    }
                                }else{
                                    return "Already taken!";
                                }
                            }
                        });
                    });
                }
            });
        },
        nic_num: function (value) {
            return Validator.value(value).digit().maxLength(13);
        },
        ntn_num: function (value) {
            return Validator.value(value).digit().maxLength(8);
        },
        gst_num: function (value) {
            return Validator.value(value).digit().maxLength(13);
        },
        cr_day: function (value) {
            return Validator.value(value).digit().maxLength(3);
        },
        cr_limit: function (value) {
            return Validator.value(value).digit().maxLength(8);
        },
    },
    methods: {
        createParty: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success_form) {
                self.$refs.sel_city.validate(function (success_city) {
                    if(success_form && success_city){
                        self.partyInformationRef
                            .orderByChild('id')
                            .limitToLast(1)
                            .once('value', function (lastIdSnap) {
                                let renderData = lastIdSnap.val();
                                let next_id = 1;
                                if (renderData !== null) {
                                    let keys = Object.keys(renderData);
                                    next_id = parseInt(renderData[keys[0]].id) + 1;
                                }
                                self.partyInformationRef.push({
                                    id: next_id,
                                    contact_name: self.contact_name,
                                    agent_code: self.agent_code,
                                    agent_name: self.agent_name,
                                    address: self.address,
                                    sel_category: self.sel_category,
                                    group_code: self.group_code,
                                    phone_num: self.phone_num,
                                    fax_num: self.fax_num,
                                    email: self.email,
                                    nic_num: self.nic_num,
                                    ntn_num: self.ntn_num,
                                    gst_num: self.gst_num,
                                    cr_day: self.cr_day,
                                    cr_limit: self.cr_limit,
                                    city: self.$refs.sel_city.query,
                                    createdAt: firebase.database.ServerValue.TIMESTAMP
                                }, function (err) {
                                    if (err) {
                                        self.errMain = err.message;
                                    } else {
                                        self.errMain = "";
                                        self.sucMain = "Successfully Inserted Party Information!";

                                        self.resetForm(self);

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
            });
        },
        updateParty: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success_form) {
                self.$refs.sel_city.validate(function (success_city) {
                    if(success_form && success_city){
                        self.partyInformationRef.child(self.sel_party).update({
                            contact_name: self.contact_name,
                            agent_code: self.agent_code,
                            agent_name: self.agent_name,
                            address: self.address,
                            sel_category: self.sel_category,
                            group_code: self.group_code,
                            phone_num: self.phone_num,
                            fax_num: self.fax_num,
                            email: self.email,
                            nic_num: self.nic_num,
                            ntn_num: self.ntn_num,
                            gst_num: self.gst_num,
                            cr_day: self.cr_day,
                            cr_limit: self.cr_limit,
                            city: self.$refs.sel_city.query,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                            } else {
                                self.errMain = "";
                                self.sucMain = "Successfully Update Party Information!";

                                self.sel_party = "";

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
            });
        },
        voucherUpdateValues: function (self, key) {
            self.resetForm(self);
            self.updateP = false;
            if(key !== ""){
                let sel_row = self.partyData[key];

                self.updateP = true;
                self.contact_name = sel_row.contact_name;
                self.agent_code = sel_row.agent_code;
                self.agent_name = sel_row.agent_name;
                self.address = sel_row.address;
                self.sel_category = sel_row.sel_category;
                self.group_code = sel_row.group_code;
                self.phone_num = sel_row.phone_num;
                self.fax_num = sel_row.fax_num;
                self.email = sel_row.email;
                self.nic_num = sel_row.nic_num;
                self.ntn_num = sel_row.ntn_num;
                self.gst_num = sel_row.gst_num;
                self.cr_day = sel_row.cr_day;
                self.cr_limit = sel_row.cr_limit;
                self.$refs.sel_city.query = sel_row.city;
            }
        },
        resetForm: function (self) {
            self.contact_name = "";
            self.agent_code = "";
            self.agent_name = "";
            self.address = "";
            self.sel_category = "";
            self.group_code = "";
            self.phone_num = "";
            self.fax_num = "";
            self.email = "";
            self.nic_num = "";
            self.ntn_num = "";
            self.gst_num = "";
            self.cr_day = "";
            self.cr_limit = "";
            self.$refs.sel_city.query = "";

            self.validation.reset();
            self.$refs.sel_city.validation.reset();
        }
    },
    components: {
        "com_cities": comCities
    }
}