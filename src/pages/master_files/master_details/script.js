import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import Promise from 'bluebird'
import func from '../../../../custom_libs/func'

import getCodes from '../../../partials/components/get_codes/get_codes.vue'
import addBrokerModel from '../../../partials/components/modals/add_broker/add_broker.vue';
import addTypeItemsModel from '../../../partials/components/modals/add_type_items/add_type_items.vue';
import getSubsName from '../../../partials/components/get_subs_name/get_subs_name.vue'
import proSubsListModel from '../../../partials/components/modals/sc_subs_list/sc_subs_list.vue'

const dateYear = require("../../../../config/client_private.json").dateYear;
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        //numeric wathcer
        let arr = ["selling_price", "booking_amount"];
        arr.forEach(function (row) {
            self.$watch(row, function (val, oldVal) {
                self[row] = func.isNumber(val, 8, "");
                self.showPaymentPlan();
            });
        });

        self.$watch("payment_installment", function (val, oldVal) {
            self.payment_installment = func.isNumber(val, 2, "");
            self.showPaymentPlan();
        });

        self.$watch("sel_master_det", function (val, oldVal) {
            self.updateVoucherVal(val);
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
        self.brokersRef = db.ref('/brokers');
        self.projectTypesRef = db.ref('/project_types');
        self.projectTypeItemsRef = db.ref('/project_type_items');
        self.masterDetailsRef = db.ref('/master_details');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');

        self.masterDetailsRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.masterDetailsData = renderData;
            } else {
                self.masterDetailsData = {};
            }
            self.dataLoad5 = false;
        });

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });

        self.brokersRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.brokersData = renderData;
            } else {
                self.brokersData = {};
            }
            self.dataLoad2 = false;
        });

        self.projectTypesRef.on('value', function (snap) {
            let renderData = snap.val();
            if (renderData !== null) {
                self.proTypesData = renderData;
            } else {
                self.proTypesData = {};
            }
            self.dataLoad3 = false;
        });

        setTimeout(function () {
            $(function () {
                $(".datepicker.booking_date").datepicker({
                    startDate: new Date(dateYear.open),
                    endDate: new Date(dateYear.close),
                    format: 'mm/dd/yyyy',
                }).on('change', function (e) {
                    let grabField = $(e.target);
                    let date = new Date(grabField.val());
                    self.booking_date = date.getTime();
                });
            });
        }, 100);
    },
    data: function () {
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,
            dataLoad2: true,
            dataLoad3: true,
            dataLoad4: false,
            dataLoad5: true,
            dataLoad6: false,
            updateV: false,
            updateStatus: false,

            // data save
            proData: {},
            brokersData: {},
            proTypesData: {},
            proTypesSubData: {},
            masterDetailsData: {},

            // references
            projectsRef: null,
            brokersRef: null,
            projectTypesRef: null,
            projectTypeItemsRef: null,
            masterDetailsRef: null,
            vouchersEntriesRef: null,

            // form fields
            sel_master_det: "",

            sel_project: "",
            allotee_code: "",
            allotee_name: "",
            contact_no: "",
            allotee_email: "",
            sel_broker: "",
            sel_type: "",
            sel_pro_type_no: "",
            doc_year: "",
            booking_date: "",
            selling_price: "",
            booking_amount: "",
            payment_installment: "",
            payment_plan: "",

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

            code_sel_ind: '',

            errMain: "",
            sucMain: "",
        }
    },
    watch: {
        sel_project: function (val) {
            let self = this;
            if(val !== ""){
                self.sel_type = self.proData[val].pro_type_id;
            }else{
                self.sel_type = "";
            }
            if(!self.updateV){
                self.loadTypesData();
            }
        },
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        allotee_code: function (value) {
            let self = this;
            return Validator.value(value).required().digit().lengthBetween(1, 11).custom(function () {
                if (value !== "") {
                    return Promise.delay(1000).then(function () {
                        return self.masterDetailsRef.orderByChild('allotee_code').equalTo(self.allotee_code).once('value').then(function (voucherSnap) {
                            let renderData = voucherSnap.val();
                            if (renderData !== null) {
                                if (self.updateV) {
                                    let keys = Object.keys(renderData);
                                    if (keys[0] !== self.sel_master_det) {
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
        allotee_name: function (value) {
            return Validator.value(value).required().lengthBetween(3, 50);
        },
        contact_no: function (value) {
            let msg = "Invalid Contact Number!";
            return Validator.value(value).required().digit(msg).lengthBetween(11, 11, msg);
        },
        allotee_email: function (value) {
            return Validator.value(value).required().email().maxLength(150);
        },
        sel_broker: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_type: function (value) {
            return Validator.value(value).required().lengthBetween(1, 11);
        },
        sel_pro_type_no: function (value) {
            let self = this;
            return Validator.value(value).required().lengthBetween(20, 36).custom(function () {
                if (value !== "") {
                    return Promise.delay(1000).then(function () {
                        return self.masterDetailsRef.orderByChild('sel_pro_type_no').equalTo(self.sel_pro_type_no).once('value').then(function (voucherSnap) {
                            let renderData = voucherSnap.val();
                            if (renderData !== null) {
                                if (self.updateV) {
                                    let keys = Object.keys(renderData);
                                    if (keys[0] !== self.sel_master_det) {
                                        return "Already booked!";
                                    }
                                } else {
                                    return "Already booked!";
                                }
                            }
                        });
                    });
                }
            });
        },
        doc_year: function (value) {
            return Validator.value(value).required().digit().lengthBetween(4, 4, "Invalid Year!");
        },
        booking_date: function (value) {
            return Validator.value(value).required().digit().maxLength(20);
        },
        selling_price: function (value) {
            return Validator.value(value).required().digit().maxLength(8);
        },
        booking_amount: function (value) {
            return Validator.value(value).required().digit().maxLength(8);
        },
        payment_installment: function (value) {
            return Validator.value(value).required().digit().maxLength(2);
        },
    },
    methods: {
        addVoucher: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    self.masterDetailsRef
                        .orderByChild('id')
                        .limitToLast(1)
                        .once('value')
                        .then(function (voucherSnap) {
                            let renderData = voucherSnap.val();
                            let next_id = 1;

                            if (renderData !== null) {
                                let keys = Object.keys(renderData);
                                next_id = parseInt(renderData[keys[0]].id) + 1;
                            }

                            let voucher_push_gen = self.masterDetailsRef.push();

                            let rows = self.rows;
                            let subLength = 0;
                            let process_item = 0;
                            rows.forEach(function (row) {
                                if (row.code !== "") {
                                    subLength++;
                                }
                            });

                            if (subLength > 0) {
                                voucher_push_gen.set({
                                    id: next_id,
                                    sel_project: self.sel_project,
                                    posted_status: "No",
                                    allotee_code: self.allotee_code,
                                    allotee_name: self.allotee_name,
                                    contact_no: self.contact_no,
                                    allotee_email: self.allotee_email,
                                    sel_broker: self.sel_broker,
                                    sel_type: self.sel_type,
                                    sel_pro_type_no: self.sel_pro_type_no,
                                    doc_year: self.doc_year,
                                    booking_date: self.booking_date,
                                    selling_price: self.selling_price,
                                    booking_amount: self.booking_amount,
                                    payment_installment: self.payment_installment,
                                    payment_plan: self.payment_plan,
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
                                                row.v_date = self.booking_date;
                                                row.createdAt = firebase.database.ServerValue.TIMESTAMP;
                                                row['type'] = "md";

                                                self.vouchersEntriesRef.push(row, function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                    }

                                                    process_item++;
                                                    if (process_item === subLength) {
                                                        self.view_plan(voucher_push_gen.key);
                                                        self.voucherMsg(self, "Successfully Inserted Master Detail Voucher!");
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });

                            } else {
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
                        self.masterDetailsRef.child(self.sel_master_det).update({
                            allotee_code: self.allotee_code,
                            allotee_name: self.allotee_name,
                            contact_no: self.contact_no,
                            allotee_email: self.allotee_email,
                            sel_broker: self.sel_broker,
                            sel_type: self.sel_type,
                            sel_pro_type_no: self.sel_pro_type_no,
                            doc_year: self.doc_year,
                            booking_date: self.booking_date,
                            selling_price: self.selling_price,
                            booking_amount: self.booking_amount,
                            payment_installment: self.payment_installment,
                            payment_plan: self.payment_plan,
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
                                        row.v_key = self.sel_master_det;
                                        row.v_date = self.booking_date;
                                        row.createdAt = firebase.database.ServerValue.TIMESTAMP;
                                        row['type'] = "md";

                                        if (key_save !== "") {
                                            self.vouchersEntriesRef.child(key_save).update(row, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }

                                                process_item++;
                                                if (process_item === subLength) {
                                                    self.sel_master_det = "";
                                                    self.voucherMsg(self, "Successfully Updated Master Detail Voucher!");
                                                }
                                            });
                                        } else {
                                            self.vouchersEntriesRef.push(row, function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }

                                                process_item++;
                                                if (process_item === subLength) {
                                                    self.sel_master_det = "";
                                                    self.voucherMsg(self, "Successfully Updated Master Detail Voucher!");
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
                let sel_voucher = self.masterDetailsData[key];

                self.sel_project = sel_voucher.sel_project;
                self.sel_type = sel_voucher.sel_type;
                self.allotee_code = sel_voucher.allotee_code;
                self.allotee_name = sel_voucher.allotee_name;
                self.contact_no = sel_voucher.contact_no;
                self.allotee_email = sel_voucher.allotee_email;
                self.sel_broker = sel_voucher.sel_broker;
                self.doc_year = sel_voucher.doc_year;
                self.booking_date = sel_voucher.booking_date;
                self.selling_price = sel_voucher.selling_price;
                self.booking_amount = sel_voucher.booking_amount;
                self.payment_installment = sel_voucher.payment_installment;
                self.payment_plan = sel_voucher.payment_plan;
                self.updateStatus = sel_voucher.posted_status !== 'Yes';

                self.loadTypesData();

                $(".datepicker.booking_date").datepicker("update", new Date(sel_voucher.booking_date));
                self.voucherEntriesGet(self);

            } else {
                self.updateV = false;
                self.fullVoucherReset(self);
            }
        },
        fullVoucherReset: function (self) {
            self.sel_project = "";
            self.allotee_code = "";
            self.allotee_name = "";
            self.contact_no = "";
            self.allotee_email = "";
            self.sel_broker = "";
            self.sel_type = "";
            self.sel_pro_type_no = "";
            self.doc_year = "";
            self.booking_date = "";
            self.selling_price = "";
            self.booking_amount = "";
            self.payment_installment = "";
            self.payment_plan = "";

            $(".datepicker.booking_date").val('');

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
                self.rows[ind].type = '';
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
            self.dataLoad6 = true;
            self.vouchersEntriesRef
                .orderByChild("v_key")
                .equalTo(self.sel_master_det)
                .once('value', function (entSnap) {
                    let entData = entSnap.val();
                    if (entData !== null) {
                        let keys = Object.keys(entData);
                        self.rows.forEach(function (row, ind) {
                            if (keys.length >= (ind + 1)) {
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
                    self.dataLoad6 = false;
                });
        },
        loadTypesData: function () {
            let self = this;
            self.proTypesSubData = {};
            self.sel_pro_type_no = "";
            if (self.sel_project !== "" && self.sel_type !== "") {
                self.dataLoad4 = true;
                self.projectTypeItemsRef.orderByChild("pro_key").equalTo(self.sel_project).on("value", function (snap) {
                    if (snap.numChildren() > 0) {
                        let grabData = {};
                        snap.forEach(function (itemSnap) {
                            let item = itemSnap.val();
                            if (item.type_key === self.sel_type) {
                                grabData[itemSnap.key] = item;
                            }
                        });
                        self.proTypesSubData = grabData;
                        if (self.updateV) {
                            self.sel_pro_type_no = self.masterDetailsData[self.sel_master_det].sel_pro_type_no;
                        }
                    } else {
                        self.proTypesSubData = {};
                    }
                    self.dataLoad4 = false;
                });
            }
        },
        showPaymentPlan: function () {
            let self = this;
            self.payment_plan = "";
            if (self.selling_price !== "" && self.booking_amount !== "" && self.payment_installment !== "") {
                self.payment_plan = (self.selling_price - self.booking_amount) / self.payment_installment;
            }
        },
        view_plan: function (sel_voucher) {
            $("<a id='forceClick' href='/sheet/payment_plan/"+sel_voucher+"' target='_blank' style='display:none;'></a>").appendTo(document.body);
            let anc = document.getElementById('forceClick');
            anc.click();
            anc.remove();
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
        addBrokerModel,
        addTypeItemsModel,
        getSubsName,
        proSubsListModel
    }
}