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

                self.regControlsRef.child(params.proId).once('value', function (regContSnap) {
                    let regContData = regContSnap.val();
                    if (regContData !== null) {
                        let keys = Object.keys(regContData);
                        let grabData = {};
                        let process_item_1 = 0;
                        keys.forEach(function (key, loopInd1, array1) {
                            let item = regContData[key];
                            self.controlsRef.child(item.key).once('value', function (contSnap) {
                                item['contData'] = contSnap.val();

                                self.regSubContRef.child(params.proId).orderByChild("cont_key").equalTo(item.key).once('value', function (regSubContSnap) {
                                    let regSubContData = regSubContSnap.val();
                                    if (regSubContData !== null) {
                                        item['contData']['regSubContData'] = {};
                                        item['contData']['regSubContData'] = regSubContData;
                                        let regSubContKeys = Object.keys(regSubContData);
                                        let process_item_2 = 0;
                                        regSubContKeys.forEach(function (rscKey, loopInd2, array2) {
                                            let rscItem = regSubContData[rscKey];

                                            self.subContRef.child(rscItem.key).once('value', function (subContSnap) {
                                                let subContData = subContSnap.val();
                                                item['contData']['regSubContData'][rscKey]['subContData'] = {};
                                                item['contData']['regSubContData'][rscKey]['subContData'] = subContData;

                                                self.regSubsidiaryRef.child(params.proId).orderByChild("sub_cont_key").equalTo(rscItem.key).once('value', function (regSubsSnap) {
                                                    let regSubsData = regSubsSnap.val();

                                                    if (regSubsData !== null) {
                                                        item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'] = {};
                                                        item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'] = regSubsData;
                                                        let regSubsKeys = Object.keys(regSubsData);
                                                        let process_item_3 = 0;
                                                        regSubsKeys.forEach(function (rssKey, loopInd3, array3) {
                                                            let rssItem = regSubsData[rssKey];

                                                            self.subsidiaryRef.child(rssItem.key).once('value', function (subsSnap) {
                                                                let subsData = subsSnap.val();
                                                                item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'][rssKey]['subsData'] = {};
                                                                item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'][rssKey]['subsData'] = subsData;

                                                                self.vouchersEntriesRef.orderByChild('code').equalTo(rssKey).once('value', function (voucherEntSnap) {
                                                                    let voucherEntData = voucherEntSnap.val();

                                                                    if (voucherEntData !== null) {
                                                                        let voucherEntKeys = Object.keys(voucherEntData);
                                                                        let grabEnt = {};
                                                                        let process_ent = 0;
                                                                        voucherEntKeys.forEach(function (vEntKey, loopInd4, array4) {
                                                                            let vEntItem = voucherEntData[vEntKey];
                                                                            if (vEntItem.type === "md") {
                                                                                self.masterDetailsRef.child(vEntItem.v_key).once('value', function (mdSnap) {
                                                                                    let mdData = mdSnap.val();
                                                                                    if (mdData.posted_status === "Yes") {
                                                                                        grabEnt[vEntKey] = vEntItem;
                                                                                    }
                                                                                    process_ent++;
                                                                                    if (process_ent === array4.length) {
                                                                                        if (Object.keys(grabEnt).length > 0) {
                                                                                            item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'][rssKey]['subsData']['entries_data'] = self.bwDatesEntObj(bw, grabEnt);
                                                                                        }
                                                                                        process_item_3++;
                                                                                        if (process_item_3 === array3.length) {
                                                                                            process_item_2++;
                                                                                            if (process_item_2 === array2.length) {
                                                                                                grabData[key] = item;
                                                                                                process_item_1++;
                                                                                                if (process_item_1 === array1.length) {
                                                                                                    self.fetchData = self.reArrange(func.sortObj(grabData, false));
                                                                                                    self.dataLoad1 = false;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });
                                                                            } else {
                                                                                self.vouchersRef.child(vEntItem.v_key).once('value', function (voucherSnap) {
                                                                                    let voucherData = voucherSnap.val();
                                                                                    if (voucherData.posted_status === "Yes") {
                                                                                        grabEnt[vEntKey] = vEntItem;
                                                                                    }
                                                                                    process_ent++;
                                                                                    if (process_ent === array4.length) {
                                                                                        if (Object.keys(grabEnt).length > 0) {
                                                                                            item['contData']['regSubContData'][rscKey]['subContData']['regSubsData'][rssKey]['subsData']['entries_data'] = self.bwDatesEntObj(bw, grabEnt);
                                                                                        }
                                                                                        process_item_3++;
                                                                                        if (process_item_3 === array3.length) {
                                                                                            process_item_2++;
                                                                                            if (process_item_2 === array2.length) {
                                                                                                grabData[key] = item;
                                                                                                process_item_1++;
                                                                                                if (process_item_1 === array1.length) {
                                                                                                    self.fetchData = self.reArrange(func.sortObj(grabData, false));
                                                                                                    self.dataLoad1 = false;
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }
                                                                        });
                                                                    } else {
                                                                        process_item_3++;
                                                                        if (process_item_3 === array3.length) {
                                                                            process_item_2++;
                                                                            if (process_item_2 === array2.length) {
                                                                                grabData[key] = item;
                                                                                process_item_1++;
                                                                                if (process_item_1 === array1.length) {
                                                                                    self.fetchData = self.reArrange(func.sortObj(grabData, false));
                                                                                    self.dataLoad1 = false;
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    } else {
                                                        process_item_2++;
                                                        if (process_item_2 === array2.length) {
                                                            grabData[key] = item;
                                                            process_item_1++;
                                                            if (process_item_1 === array1.length) {
                                                                self.fetchData = self.reArrange(func.sortObj(grabData, false));
                                                                self.dataLoad1 = false;
                                                            }
                                                        }
                                                    }
                                                });
                                            });
                                        });
                                    } else {
                                        grabData[key] = item;
                                        process_item_1++;
                                        if (process_item_1 === array1.length) {
                                            self.fetchData = self.reArrange(func.sortObj(grabData, false));
                                            self.dataLoad1 = false;
                                        }
                                    }
                                });
                            });
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
                title: 'TRIAL BALANCE',
                subTitle: 'SUB CONTROL LISTING',
                proName: '',
                date: moment().format('DD/MM/YYYY'),
                period: ''
            },
            dLinks: {
                pdf: '/download/pdf/tbal_sheet/sub_control',
                html: '/download/html/tbal_sheet/sub_control',
                csv: '/download/csv/tbal_sheet/sub_control',
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
        bwDatesEntObj: function (bwDates, entries) {
            let keys = Object.keys(entries);
            let totCr = 0;
            let totDr = 0;
            keys.forEach(function (key) {
                let item = entries[key];
                if (item.v_date >= bwDates[0] && item.v_date <= bwDates[1]) {
                    totCr += item.credit;
                    totDr += item.debit;
                }
            });
            return {credit: totCr, debit: totDr};
        },
        reArrange: function (obj) {
            let grabData = {};
            grabData['data'] = [];
            let grTotDr = 0, grTotCr = 0;
            let grTotODr = 0, grTotOCr = 0;
            let grTotCDr = 0, grTotCCr = 0;

            let ckeys = Object.keys(obj);
            ckeys.forEach(function (cKey) {
                let item = obj[cKey];
                let totODr = 0, totOCr = 0;
                let totDr = 0, totCr = 0;
                let totCDr = 0, totCCr = 0;
                let subContCheck = false;

                if(item.contData.regSubContData){
                    let scKeys = Object.keys(item.contData.regSubContData);
                    scKeys.forEach(function (scKey) {
                        let subItem = item.contData.regSubContData[scKey];
                        let scTotOCr = subItem.credit, scTotODr = subItem.debit;
                        let scTotCr = 0, scTotDr = 0;
                        let scTotCCr = 0, scTotCDr = 0;
                        let subsCheck = false;

                        if(subItem.subContData.regSubsData){
                            let ssKeys = Object.keys(subItem.subContData.regSubsData);
                            ssKeys.forEach(function (ssKey) {
                                let ssItem = subItem.subContData.regSubsData[ssKey];
                                let ssTotDr = ssItem.debit, ssTotCr = ssItem.credit;

                                if(ssItem.subsData.entries_data){
                                    ssTotDr += ssItem.subsData.entries_data.debit; ssTotCr += ssItem.subsData.entries_data.credit;
                                    scTotDr += ssTotDr; scTotCr += ssTotCr;

                                    subsCheck = true;
                                }
                            });
                        }
                        if(subsCheck){
                            let bal = (scTotODr + scTotDr)-(scTotOCr + scTotCr);
                            scTotCCr += (bal < 0) ? -(bal) : 0; scTotCDr += (bal > -1) ? bal : 0;
                            totOCr += scTotOCr; totODr += scTotODr;
                            totCCr += scTotCCr; totCDr += scTotCDr;
                            totCr += scTotCr; totDr += scTotDr;
                            subContCheck = true;

                            grabData['data'].push({
                                id: scKey,
                                name: subItem.subContData.name,
                                totODr: scTotODr,
                                totOCr: scTotOCr,
                                totDr: scTotDr,
                                totCr: scTotCr,
                                totCDr: scTotCDr,
                                totCCr: scTotCCr,
                            });
                        }
                    });
                }
                if(subContCheck){
                    grTotCr += totCr; grTotDr += totDr;
                    grTotODr += totODr; grTotOCr += totOCr;
                    grTotCDr += totCDr; grTotCCr += totCCr;

                    grabData['data'].push({
                        id: "Total Control",
                        name: cKey+" "+item.contData.name,
                        totODr: totODr,
                        totOCr: totOCr,
                        totDr: totDr,
                        totCr: totCr,
                        totCDr: totCDr,
                        totCCr: totCCr,
                    });
                }
            });
            grabData['reqData'] = {
                grTotODr: grTotODr,
                grTotOCr: grTotOCr,
                grTotDr: grTotDr,
                grTotCr: grTotCr,
                grTotCDr: grTotCDr,
                grTotCCr: grTotCCr,
            };
            return grabData;
        }
    },
    components: {
        downloadSheetModel
    }
}