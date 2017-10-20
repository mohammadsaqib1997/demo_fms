import firebase from 'firebase'
import moment from 'moment'
import func from '../../../../custom_libs/func'

import downloadSheetModel from '../../../partials/components/modals/download_sheet/download_sheet.vue'

export default {
    created: function () {
        let self = this;
        let params = self.$route.params;
        let bw = [params.startDate, params.endDate];
        bw.sort();

        const db = firebase.database();
        self.projectRef = db.ref('/projects');
        self.regControlsRef = db.ref('/reg_controls');
        self.controlsRef = db.ref('/controls');
        self.regSubContRef = db.ref('/reg_sub_controls');
        self.subContRef = db.ref('/sub_controls');
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.subsidiaryRef = db.ref('/subsidiary');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');
        self.masterDetailsRef = db.ref('/master_details');
        self.vouchersRef = db.ref('/vouchers');

        self.projectRef.child(params.proId).on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.optionalData.proName = renderData.name;
                self.optionalData.period = moment(parseInt(bw[0])).format('DD/MM/YYYY') + " - " + moment(parseInt(bw[1])).format('DD/MM/YYYY');

                self.vouchersEntriesRef.orderByChild("code").equalTo(params.subsId).once('value', function (voucherEntSnap) {
                    let voucherEntData = voucherEntSnap.val();
                    if (voucherEntData !== null) {
                        let keys = Object.keys(voucherEntData);
                        let process_item = 0;
                        let grabEnt = [];
                        keys.forEach(function (key) {
                            let item = voucherEntData[key];
                            item['date'] = moment(item.v_date).format("DD/MM/YYYY");

                            if (item.type === "jv") {
                                self.vouchersRef.child(item.v_key).once('value', function (voucherSnap) {
                                    let voucherData = voucherSnap.val();
                                    if (voucherData !== null && voucherData.posted_status === "Yes") {
                                        item['v_id'] = voucherData.id;
                                        grabEnt.push(item);
                                    }
                                    process_item++;
                                    if (process_item === keys.length) {
                                        grabEnt = func.sortObjByVal(grabEnt, "v_date");
                                        grabEnt = self.bwDatesEntries(bw, grabEnt);
                                        self.fetchData['data'] = grabEnt.newEnt;
                                        self.fetchData['reqData'] = {
                                            code: (item.code) ? item.code : "",
                                            codeName: (item.code_name) ? item.code_name : "",
                                            balance: grabEnt.balance,
                                            extra: self.reArrange(grabEnt.newEnt, grabEnt.balance)
                                        };
                                        self.dataLoad1 = false;
                                    }
                                });
                            } else if (item.type === "md") {
                                self.masterDetailsRef.child(item.v_key).once('value', function (mdSnap) {
                                    let mdData = mdSnap.val();
                                    if (mdData !== null && mdData.posted_status === "Yes") {
                                        item['v_id'] = mdData.id;
                                        grabEnt.push(item);
                                    }
                                    process_item++;
                                    if (process_item === keys.length) {
                                        grabEnt = func.sortObjByVal(grabEnt, "v_date");
                                        grabEnt = self.bwDatesEntries(bw, grabEnt);
                                        self.fetchData['data'] = grabEnt.newEnt;
                                        self.fetchData['reqData'] = {
                                            code: (item.code) ? item.code : "",
                                            codeName: (item.code_name) ? item.code_name : "",
                                            balance: grabEnt.balance,
                                            extra: self.reArrange(grabEnt.newEnt, grabEnt.balance)
                                        };
                                        self.dataLoad1 = false;
                                    }
                                });
                            }
                        });
                    } else {
                        self.dataLoad1 = false;
                    }
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
                title: 'M.I.S REPORTS',
                subTitle: 'DETAIL LEDGER',
                proName: '',
                date: moment().format('DD/MM/YYYY'),
                period: ''
            },
            dLinks: {
                pdf: '/download/pdf/detail_ledger/subsidiary',
                html: '/download/html/detail_ledger/subsidiary',
                csv: '/download/csv/detail_ledger/subsidiary',
            },

            // references
            regControlsRef: null,
            controlsRef: null,
            projectRef: null,
            regSubContRef: null,
            subContRef: null,
            regSubsidiaryRef: null,
            subsidiaryRef: null,
            vouchersEntriesRef: null,
            masterDetailsRef: null,
            vouchersRef: null,
        }
    },
    methods: {
        bwDatesEntries: function (bwDates, objEnt) {
            let newGrabEnt = [];
            let balCr = 0;
            let balDr = 0;
            objEnt.forEach(function (row) {
                let sel_row = null;
                if (row.v_date < bwDates[0]) {
                    balCr += row.credit;
                    balDr += row.debit;
                }
                if (row.v_date >= bwDates[0] && row.v_date <= bwDates[1]) {
                    sel_row = row;
                }
                if (sel_row !== null) {
                    newGrabEnt.push(sel_row);
                }
            });
            return {newEnt: newGrabEnt, balance: {balCr: balCr, balDr: balDr}};
        },
        reArrange: function (arr, bal) {
            let grabData = {
                totCr: bal.balCr,
                totDr: bal.balDr
            };
            arr.forEach(function(item){
                grabData.totCr += item.credit;
                grabData.totDr += item.debit;
            });
            return grabData;
        }
    },
    components: {
        downloadSheetModel
    }
}