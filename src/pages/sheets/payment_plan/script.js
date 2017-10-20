import firebase from 'firebase'
import moment from 'moment'
import func from '../../../../custom_libs/func'

import downloadSheetModel from '../../../partials/components/modals/download_sheet/download_sheet.vue'

export default {
    created: function () {
        let self = this;
        let params = self.$route.params;

        const db = firebase.database();
        self.projectRef = db.ref('/projects');
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');
        self.masterDetailsRef = db.ref('/master_details');
        self.vouchersRef = db.ref('/vouchers');
        self.brokersRef = db.ref('/brokers');
        self.projectTypesRef = db.ref('/project_types');
        self.projectTypeItemsRef = db.ref('/project_type_items');

        self.masterDetailsRef.child(params.mdId).once('value', function (mdSnap) {
            let mdData = mdSnap.val();
            if (mdData !== null) {
                self.projectRef.child(mdData.sel_project).once('value', function (projectSnap) {
                    let projectData = projectSnap.val();
                    mdData['sel_project'] = projectData.name;

                    self.brokersRef.child(mdData.sel_broker).once('value', function (brokerSnap) {
                        let brokerData = brokerSnap.val();
                        mdData['sel_broker'] = brokerData.name;

                        self.projectTypesRef.child(mdData.sel_type).once('value', function (proTypeSnap) {
                            let proTypeData = proTypeSnap.val();
                            mdData['sel_type'] = proTypeData.name;

                            self.projectTypeItemsRef.child(mdData.sel_pro_type_no).once('value', function (proTypeItemSnap) {
                                let proTypeItemData = proTypeItemSnap.val();
                                mdData['sel_pro_type_no'] = proTypeItemData.name;

                                self.regSubsidiaryRef.child(projectSnap.key).orderByChild("key").equalTo(proTypeItemData.subs_key).once('value', function (regSubsSnap) {
                                    let regSubsCode = Object.keys(regSubsSnap.val())[0];
                                    self.vouchersEntriesRef.orderByChild("v_key").equalTo(mdSnap.key).once('value', function (md_entSnap) {
                                        if (md_entSnap.numChildren() > 0) {
                                            let process_item = 0;
                                            let grabEnt = {};
                                            grabEnt['md_data'] = [];
                                            grabEnt['ins_data'] = {};
                                            md_entSnap.forEach(function (entItemSnap) {
                                                let entItemData = entItemSnap.val();
                                                if (regSubsCode === entItemData.code) {
                                                    let date = moment(entItemData.v_date);
                                                    grabEnt.md_data.push({
                                                        inst_ind: '00',
                                                        type: "MD",
                                                        voucher_id: mdData.id,
                                                        installment: entItemData.credit,
                                                        amount: entItemData.credit,
                                                        penalty: false,
                                                        pay_date: date.format("DD/MM/YYYY"),
                                                        due_date: date.format("DD/MM/YYYY"),
                                                        due_date_unix: date.unix(),
                                                    });
                                                }

                                                process_item++;
                                                if (process_item === md_entSnap.numChildren()) {
                                                    let booking_date = moment(mdData.booking_date);
                                                    let paymentInstallments = (mdData.payment_installment > 99) ? 99:mdData.payment_installment;
                                                    for (let i = 0; i < paymentInstallments; i++) {
                                                        let dueDate = booking_date.add(1, "M");
                                                        grabEnt.ins_data[i+1] = {
                                                            inst_ind: ('0'+(i+1)).slice(-2),
                                                            type: "",
                                                            voucher_id: "",
                                                            installment: mdData.payment_plan,
                                                            amount: 0,
                                                            penalty: false,
                                                            pay_date: false,
                                                            due_date: dueDate.format("DD/MM/YYYY"),
                                                            due_date_unix: dueDate.unix(),
                                                        };
                                                    }

                                                    self.vouchersRef.orderByChild("ref_key").equalTo(mdSnap.key).once('value', function (jvSnap) {

                                                        if (jvSnap.numChildren() > 0) {
                                                            let jvData = jvSnap.val();
                                                            let keys = Object.keys(jvData);
                                                            keys.forEach(function (key, loopInd, arr) {
                                                                let jvItem = jvData[key];
                                                                if (jvItem.posted_status === "Yes") {
                                                                    self.vouchersEntriesRef.orderByChild("v_key").equalTo(key).once('value', function (jvEntSnap) {
                                                                        if (jvEntSnap.numChildren() > 0) {
                                                                            jvEntSnap.forEach(function (jvPayEntSnap) {
                                                                                let jvEntItem = jvPayEntSnap.val();
                                                                                if (regSubsCode === jvEntItem.code) {
                                                                                    let payDate = moment(jvEntItem.v_date);

                                                                                    grabEnt.ins_data[jvItem.pay_installment]['type'] = "JV";
                                                                                    grabEnt.ins_data[jvItem.pay_installment]['voucher_id'] = jvItem.id;
                                                                                    grabEnt.ins_data[jvItem.pay_installment]['pay_date'] = payDate.format("DD/MM/YYYY");
                                                                                    grabEnt.ins_data[jvItem.pay_installment]['amount'] = jvEntItem.credit;

                                                                                    if(payDate.unix() > grabEnt.ins_data[jvItem.pay_installment].due_date_unix){
                                                                                        grabEnt.ins_data[jvItem.pay_installment]['penalty'] = true;
                                                                                    }
                                                                                }
                                                                            });
                                                                        }

                                                                        if (loopInd === arr.length - 1) {
                                                                            mdData['booking_date'] = moment(mdData.booking_date).format("DD/MM/YYYY");
                                                                            self.fetchData = self.reArrange({
                                                                                data: mdData,
                                                                                entData: grabEnt
                                                                            });
                                                                            self.dataLoad1 = false;
                                                                        }
                                                                    });
                                                                } else {
                                                                    if (loopInd === arr.length - 1) {
                                                                        mdData['booking_date'] = moment(mdData.booking_date).format("DD/MM/YYYY");
                                                                        self.fetchData = self.reArrange({
                                                                            data: mdData,
                                                                            entData: grabEnt
                                                                        });
                                                                        self.dataLoad1 = false;
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            mdData['booking_date'] = moment(mdData.booking_date).format("DD/MM/YYYY");
                                                            self.fetchData = self.reArrange({
                                                                data: mdData,
                                                                entData: grabEnt
                                                            });
                                                            self.dataLoad1 = false;
                                                        }
                                                    });
                                                }
                                            });
                                        } else {
                                            self.dataLoad1 = false;
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                self.$router.push('/');
            }
        });

    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            dataLoad2: false,

            // data save
            proData: {},
            fetchData: {},
            optionalData: {
                title: 'Payment Plan',
                subTitle: '',
                date: moment().format('DD/MM/YYYY')
            },
            dLinks: {
                pdf: '/download/pdf/payment_plan',
                html: '/download/html/payment_plan',
                csv: null,
            },

            // references
            projectRef: null,
            regSubsidiaryRef: null,
            vouchersEntriesRef: null,
            masterDetailsRef: null,
            vouchersRef: null,
            brokersRef: null,
            projectTypesRef: null,
            projectTypeItemsRef: null,
        }
    },
    methods: {
        reArrange: function (obj) {
            let grabData = {};
            grabData['entData'] = [];
            grabData['data'] = obj.data;
            let totAmount = 0, totPenalty = 0, totInstallment = 0, totRemAmount = 0;
            let balance = obj.data.selling_price;
            obj.entData.md_data.forEach(function (md_ent_item) {
                totAmount += md_ent_item.amount;
                balance -= md_ent_item.amount;
                let penalty = (md_ent_item.penalty) ? (md_ent_item.installment*1)/100:0;
                totPenalty += penalty;
                balance += penalty;
                let remaining = ((md_ent_item.installment + penalty) - md_ent_item.amount);
                totInstallment += md_ent_item.installment;
                totRemAmount += remaining;

                md_ent_item['penalty'] = (penalty > 0) ? penalty:"";
                md_ent_item['remaining'] = remaining;
                md_ent_item['balance'] = balance;

                grabData['entData'].push(md_ent_item);
            });
            let ins_keys = Object.keys(obj.entData.ins_data);
            ins_keys.forEach(function(ins_key){
                let item = obj.entData.ins_data[ins_key];

                totAmount += item.amount;
                balance -= item.amount;
                let penalty = (item.penalty) ? (item.installment*1)/100:0;
                totPenalty += penalty;
                balance += penalty;
                let remaining = ((item.installment + penalty) - item.amount);
                totInstallment += item.installment;
                totRemAmount += remaining;

                item['penalty'] = (penalty > 0) ? penalty:"";
                item['remaining'] = remaining;
                item['balance'] = balance;

                grabData['entData'].push(item);

            });
            grabData['reqData'] = {
                totPenalty: totPenalty,
                totInstallment: totInstallment,
                totAmount: totAmount,
                totRemAmount: totRemAmount,
            };
            return grabData;
        }
    },
    components: {
        downloadSheetModel
    }
}