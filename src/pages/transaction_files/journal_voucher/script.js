import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import Promise from 'bluebird'
import func from '../../../../custom_libs/func'
import moment from 'moment'

import getCodes from '../../../partials/components/get_codes/get_codes.vue'
import getSubsName from '../../../partials/components/get_subs_name/get_subs_name.vue'
import proSubsListModel from '../../../partials/components/modals/sc_subs_list/sc_subs_list.vue'

const Validator = SimpleVueValidation.Validator;
const dateYear = require("../../../../config/client_private.json").dateYear;

export default {
    created: function () {
        let self = this;

        self.userType = self.$root.loginUData.type;
        self.setPostStatus();

        self.$watch("sel_voucher", function (val, oldVal) {
            self.updateVoucherVal(val);
        });

        self.$watch('ref_type', function (val, oldVal) {
            self.sel_ref = "";
        });

        self.$watch('sel_project', function (val, oldVal) {
            self.loadMasterDetails();
        });

        self.rows.forEach(function (row, ind) {
            self.$watch(function () {
                return self.rows[ind].quantity;
            }, function (val) {
                self.rows[ind].quantity = func.isNumber(val);
            });
            self.$watch(function () {
                return self.rows[ind].credit;
            }, function (val) {
                self.rows[ind].credit = func.isNumber(val);
                self.totalCredit();
            });
            self.$watch(function () {
                return self.rows[ind].debit;
            }, function (val) {
                self.rows[ind].debit = func.isNumber(val);
                self.totalDebit();
            });
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.vouchersRef = db.ref('/vouchers');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');
        self.masterDetailsRef = db.ref('/master_details');
        self.partyInformationRef = db.ref('/party_information');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });

        self.vouchersRef.on('value', function (vouchersSnap) {
            let renderData = vouchersSnap.val();
            if (renderData !== null) {
                self.vouchersData = renderData;
            } else {
                self.vouchersData = {};
            }
            self.dataLoad2 = false;
        });

        self.partyInformationRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.partyInformationData = renderData;
            } else {
                self.partyInformationData = {};
            }
            self.dataLoad4 = false;
        });
    },
    mounted: function () {
        let self = this;
        $(function () {
            $(".datepicker.voucher_date").datepicker({
                startDate: new Date(dateYear.open),
                endDate: new Date(dateYear.close),
                format: 'mm/dd/yyyy',
            }).on('change', function (e) {
                let grabField = $(e.target);
                let date = new Date(grabField.val());
                self.voucher_date = date.getTime();
            });
        });
    },
    data: function () {
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: false,
            dataLoad4: true,
            dataLoad5: false,
            updateV: false,
            updateStatus: false,

            // data save
            proData: {},
            vouchersData: {},
            masterDetailsData: {},
            partyInformationData: {},
            selectVoucherData: {},

            // references
            projectsRef: null,
            masterDetailsRef: null,
            partyInformationRef: null,
            vouchersRef: null,
            vouchersEntriesRef: null,

            // form fields
            userType: "admin",
            sel_voucher: "",
            rows: [
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
                {
                    key: '',
                    code: '',
                    code_name: '',
                    remarks: '',
                    quantity: 0,
                    debit: 0,
                    credit: 0,
                    v_key: '',
                    v_date: 0,
                    createdAt: 0,
                },
            ],
            total_debit: 0,
            total_credit: 0,
            voucher_id: "",
            v_remarks: "",
            posted_status: "Yes",
            ref_type: "mis",
            sel_ref: "",
            sel_project: "",
            voucher_date: "",
            errMain: "",
            sucMain: "",

            gen_installments: [],
            sel_installment: "",

            code_sel_ind: ""
        }
    },
    watch: {
        sel_ref: function (val) {
            let self = this;
            self.gen_installments = [];
            self.sel_installment = "";
            if(self.ref_type === "md" && val !== ""){
                let mdData = self.masterDetailsData[val];
                let loopInc = (mdData.payment_installment > 99) ? 99 : mdData.payment_installment;

                for (let i = 0; i < loopInc; i++) {
                    self.gen_installments.push(i+1);
                }
                if(self.ref_type === "md" && self.updateV && self.sel_ref === self.selectVoucherData.ref_key){
                    self.sel_installment = self.selectVoucherData.pay_installment;
                }
            }
        }
    },
    validators: {
        voucher_id: function (value) {
            let self = this;
            let setValidator = Validator.value(value);
            if (self.updateV) {
                setValidator.required();
            }
            return setValidator.digit().maxLength(20).custom(function () {
                value = parseInt(value);
                if (value !== "" && !isNaN(value)) {
                    return Promise.delay(1000).then(function () {
                        return self.vouchersRef.orderByChild('id').equalTo(value).once('value').then(function (voucherSnap) {
                            let renderData = voucherSnap.val();
                            if (renderData !== null) {
                                if (self.updateV) {
                                    let keys = Object.keys(renderData);
                                    if (keys[0] !== self.sel_voucher) {
                                        return "Already taken!";
                                    }
                                } else {
                                    return "Already taken!";
                                }
                            }
                        });
                    });
                }
            });
        },
        v_remarks: function (value) {
            return Validator.value(value).required().lengthBetween(6, 35);
        },
        posted_status: function (value) {
            return Validator.value(value).required().in(['Yes', 'No'], "Invalid Status!");
        },
        ref_type: function (value) {
            return Validator.value(value).in(['mis', 'md', 'pi'], "Invalid Reference Type!");
        },
        sel_ref: function(value){
            if(this.ref_type === "md" || this.ref_type === "pi"){
                return Validator.value(value).required().lengthBetween(20, 36);
            }
        },
        sel_installment: function(value){
            let self = this;
            if(this.ref_type === "md"){
                return Validator.value(value).required().maxLength(5).custom(function () {
                    if(value !== ""){
                        return Promise.delay(1000).then(function () {
                            return self.vouchersRef.orderByChild('ref_key').equalTo(self.sel_ref).once('value').then(function (voucherSnap) {
                                let renderData = voucherSnap.val();
                                if (renderData !== null) {
                                    let valid = true;
                                    voucherSnap.forEach(function (voucherItemSnap) {
                                        let item = voucherItemSnap.val();
                                        if(value === item.pay_installment){
                                            if(self.updateV){
                                                if(voucherItemSnap.key !== self.sel_voucher){
                                                    valid = false;
                                                    return true;
                                                }
                                            }else{
                                                valid = false;
                                                return true;
                                            }
                                        }
                                    });

                                    if(!valid){
                                        return "Already payed!";
                                    }
                                }
                            });
                        });
                    }
                });
            }
        },
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        voucher_date: function (value) {
            return Validator.value(value).required().digit().maxLength(20);
        },
    },
    methods: {
        addVoucher: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    self.vouchersRef
                        .orderByChild('id')
                        .limitToLast(1)
                        .once('value')
                        .then(function (voucherSnap) {
                            let renderData = voucherSnap.val();
                            let next_id = 1;
                            if (self.voucher_id !== "") {
                                next_id = parseInt(self.voucher_id);
                            } else {
                                if (renderData !== null) {
                                    let keys = Object.keys(renderData);
                                    next_id = parseInt(renderData[keys[0]].id) + 1;
                                }
                            }

                            let rows = self.rows;
                            let subLength = 0;
                            let process_item = 0;
                            rows.forEach(function (row) {
                                if (row.code !== "") {
                                    subLength++;
                                }
                            });

                            if(subLength > 0){
                                let voucher_push_gen = self.vouchersRef.push();

                                voucher_push_gen.set({
                                    id: next_id,
                                    v_remarks: self.v_remarks,
                                    posted_status: self.posted_status,
                                    sel_project: self.sel_project,
                                    ref_type: self.ref_type,
                                    ref_key: self.sel_ref,
                                    pay_installment: self.sel_installment,
                                    voucher_date: self.voucher_date,
                                    uid: firebase.auth().currentUser.uid,
                                    createdAt: firebase.database.ServerValue.TIMESTAMP
                                }, function (err) {
                                    if (err) {
                                        self.errMain = err.message;
                                        self.inProcess = false;
                                    } else {
                                        rows.forEach(function (row, ind) {
                                            if (row.code !== "") {
                                                delete row['key'];
                                                row.v_key = voucher_push_gen.key;
                                                row.v_date = self.voucher_date;
                                                row.createdAt = firebase.database.ServerValue.TIMESTAMP;
                                                row['type'] = "jv";

                                                self.vouchersEntriesRef.push(row, function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    }

                                                    process_item++;
                                                    if (process_item === subLength) {
                                                        self.voucherMsg(self, "Successfully Inserted Voucher!");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }else{
                                self.inProcess = false;
                                alert("Please fill entries!");
                            }
                        });
                } else {
                    self.inProcess = false;
                }
            });
        },
        updateVoucher: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    let rows = self.rows;
                    let subLength = 0;
                    let process_item = 0;
                    rows.forEach(function (row) {
                        if (row.code !== "") {
                            subLength++;
                        }
                    });

                    if (subLength > 0) {
                        self.vouchersRef.child(self.sel_voucher).update({
                            id: self.voucher_id,
                            v_remarks: self.v_remarks,
                            posted_status: self.posted_status,
                            ref_type: self.ref_type,
                            ref_key: self.sel_ref,
                            pay_installment: self.sel_installment,
                            voucher_date: self.voucher_date,
                            uid: firebase.auth().currentUser.uid,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        }, function (err) {
                            if (err) {
                                self.errMain = err.message;
                                self.inProcess = false;
                            } else {
                                rows.forEach(function (row, ind) {
                                    let key_save = row.key;
                                    if (row.code !== "") {
                                        delete row['key'];
                                        row.v_key = self.sel_voucher;
                                        row.v_date = self.voucher_date;
                                        row.createdAt = firebase.database.ServerValue.TIMESTAMP;
                                        row['type'] = "jv";

                                        if(key_save !== ""){
                                            self.vouchersEntriesRef.child(key_save).update(row, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }

                                                process_item++;
                                                if (process_item === subLength) {
                                                    self.sel_voucher = "";
                                                    self.voucherMsg(self, "Successfully Updated Voucher!");
                                                }
                                            });
                                        }else{
                                            self.vouchersEntriesRef.push(row, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }

                                                process_item++;
                                                if (process_item === subLength) {
                                                    self.sel_voucher = "";
                                                    self.voucherMsg(self, "Successfully Updated Voucher!");
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    } else {
                        self.inProcess = false;
                        alert("Please fill entries!");
                    }
                } else {
                    self.inProcess = false;
                }
            });
        },
        changeCode: function (e, ind) {
            if (e !== "") {
                this.rows[ind].code = e.code;
                this.rows[ind].code_name = e.sub_name;
            }
        },
        changeSubName: function (e, ind) {
            if (e !== "") {
                this.rows[ind].code = e.code;
                this.rows[ind].code_name = e.name;
            }
        },
        totalCredit: function () {
            let self = this;
            self.total_credit = 0;
            self.rows.forEach(function (row) {
                self.total_credit += row.credit;
            });
        },
        totalDebit: function () {
            let self = this;
            self.total_debit = 0;
            self.rows.forEach(function (row) {
                self.total_debit += row.debit;
            });
        },
        updateVoucherVal: function (key) {
            let self = this;
            if (key !== "") {
                self.updateV = true;
                self.fullVoucherReset(self);
                self.selectVoucherData = self.vouchersData[key];
                self.voucher_id = self.selectVoucherData.id;
                self.v_remarks = self.selectVoucherData.v_remarks;
                self.posted_status = self.selectVoucherData.posted_status;
                self.updateStatus = self.selectVoucherData.posted_status !== 'Yes';
                self.ref_type = self.selectVoucherData.ref_type;
                self.sel_project = self.selectVoucherData.sel_project;
                self.voucher_date = self.selectVoucherData.voucher_date;
                $(".datepicker.voucher_date").datepicker("setDate", new Date(self.selectVoucherData.voucher_date));
                self.loadMasterDetails();
                self.voucherEntriesGet(self);

            } else {
                self.updateV = false;
                self.selectVoucherData = {};
                self.fullVoucherReset(self);
            }
        },
        fullVoucherReset: function (self) {
            self.setPostStatus();
            self.voucher_id = "";
            self.v_remarks = "";
            self.ref_type = "mis";
            self.sel_ref = "";
            self.sel_project = "";
            $(".datepicker.voucher_date").val('');
            self.voucher_date = "";
            self.rows.forEach(function (row, ind) {
                self.rows[ind].key = '';
                self.rows[ind].code = '';
                self.rows[ind].code_name = '';
                self.rows[ind].remarks = '';
                self.rows[ind].quantity = 0;
                self.rows[ind].debit = 0;
                self.rows[ind].credit = 0;
                self.rows[ind].v_key = '';
                self.rows[ind].v_date = 0;
                self.rows[ind].type = "";
                self.rows[ind].createdAt = 0;
            });
            self.validation.reset();
        },
        voucherMsg: function (self, msg) {
            self.errMain = "";
            self.sucMain = msg;

            self.fullVoucherReset(self);

            self.inProcess = false;
            setTimeout(function () {
                self.sucMain = "";
            }, 1500);
        },
        voucherEntriesGet: function (self) {
            self.dataLoad3 = true;
            self.vouchersEntriesRef
                .orderByChild("v_key")
                .equalTo(self.sel_voucher)
                .once('value', function (entSnap) {
                    let entData = entSnap.val();
                    if(entData !== null){
                        let keys = Object.keys(entData);
                        self.rows.forEach(function (row, ind) {
                            if(keys.length >= (ind+1)){
                                let item = entData[keys[ind]];
                                self.rows[ind].key = keys[ind];
                                self.rows[ind].code = item.code;
                                self.rows[ind].code_name = item.code_name;
                                self.rows[ind].createdAt = item.createdAt;
                                self.rows[ind].credit = item.credit;
                                self.rows[ind].debit = item.debit;
                                self.rows[ind].quantity = item.quantity;
                                self.rows[ind].remarks = item.remarks;
                                self.rows[ind].v_date = item.v_date;
                                self.rows[ind].v_key = item.v_key;
                            }
                        });
                    }
                    self.dataLoad3 = false;
                });
        },
        setPostStatus: function () {
            let self = this;
            if(self.userType === "admin"){
                self.posted_status = "Yes";
            }else{
                self.posted_status = "No";
            }
        },
        loadMasterDetails: function () {
            let self = this;
            self.sel_ref = "";
            if(self.sel_project !== ""){
                self.dataLoad4 = true;
                self.masterDetailsRef.orderByChild('sel_project').equalTo(self.sel_project).once('value', function (snap) {
                    let renderData = snap.val();
                    if (renderData !== null) {
                        self.masterDetailsData = renderData;
                        if(self.ref_type === "md" && self.updateV){
                            self.sel_ref = self.selectVoucherData.ref_key;
                        }
                    } else {
                        self.masterDetailsData = {};
                    }
                    self.dataLoad4 = false;
                });
            }else{
                self.masterDetailsData = {};
                self.dataLoad4 = false;
            }
        },
        copyRemarks: function (ind, event) {
            let self = this;
            if(event.keyCode === 114){
                event.preventDefault();
                if(ind > 0){
                    self.rows[ind].remarks = self.rows[ind-1].remarks;
                }
            }
        },
        getList: function (ind) {
            this.code_sel_ind = ind;
            $("#proSubsList").modal("show");
        },
        setSelCode: function (e) {
            this.changeCode(e, this.code_sel_ind)
        }
    },
    components: {
        getCodes,
        getSubsName,
        proSubsListModel
    }
}