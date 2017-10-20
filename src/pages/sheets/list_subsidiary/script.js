import firebase from 'firebase'
import moment from 'moment'
import func from '../../../../custom_libs/func'

import downloadSheetModel from '../../../partials/components/modals/download_sheet/download_sheet.vue'

export default {
    created: function () {
        let self = this;
        let params = self.$route.params;
        let bw = [params.startId, params.endId];
        bw.sort();

        const db = firebase.database();
        self.projectRef = db.ref('/projects');
        self.controlsRef = db.ref('/controls');
        self.subControlsRef = db.ref('/sub_controls');
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.subsidiaryRef = db.ref('/subsidiary');

        self.projectRef.child(params.proId).on('value', function (proSnap) {
            let renderData = proSnap.val();
            if(renderData !== null){
                self.optionalData.proName = renderData.name;

                self.regSubsidiaryRef.child(params.proId).orderByKey().startAt(bw[0]).endAt(bw[1]).once('value').then(function (regSubsSnap) {
                    let regSubsData = regSubsSnap.val();
                    if(regSubsData !== null){
                        let ids = Object.keys(regSubsData);
                        let ids_length = ids.length;
                        let process_item = 0;
                        let grabData = {};
                        let contDataObj = {};
                        let subContDataObj = {};
                        let subsDataObj = {};
                        ids.forEach(function (id) {
                            let row = regSubsData[id];
                            // get subsidiary
                            self.subsidiaryRef.child(row.key).once('value').then(function (subsSnap) {
                                let subsData = subsSnap.val();
                                // get sub control
                                self.subControlsRef.child(subsData.sub_cont_key).once('value').then(function (subContSnap) {
                                    let subContData = subContSnap.val();
                                    // get control
                                    self.controlsRef.child(subContData.cont_key).once('value').then(function (contSnap) {
                                        let contData = contSnap.val();

                                        contData['id'] = func.genInvoiceNo(contData.id, '00', 3);
                                        contDataObj[contData.id] = contData;

                                        subContData['cont_id'] = contData.id;
                                        subContData['id'] = func.genInvoiceNo(subContData.id, '000', 4);
                                        subContDataObj[contData.id+subContData.id] = subContData;

                                        subsData['cont_id'] = contData.id;
                                        subsData['sub_cont_id'] = subContData.id;
                                        subsData['id'] = func.genInvoiceNo(subsData.id, '00', 3);
                                        subsDataObj[contData.id+subContData.id+subsData.id] = subsData;

                                        process_item++;
                                        if(ids_length === process_item) {
                                            grabData = {
                                                cont_data: contDataObj,
                                                sub_cont_data: subContDataObj,
                                                subs_data: subsDataObj
                                            };
                                            self.fetchData = grabData;
                                            self.dataLoad1 = false;
                                        }
                                    });
                                });
                            });
                        });
                    }else{
                        self.dataLoad1 = false;
                    }
                });
            }else{
                self.$router.push('/');
            }
        });
    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,

            // data save
            proData: {},
            fetchData: {},
            optionalData: {
                title: 'MASTER LISTING',
                subTitle: 'SUBSIDIARY LISTING',
                proName: '',
                date: moment().format('DD/MM/YYYY'),
            },
            dLinks: {
                pdf: '/download/pdf/listing/subsidiary',
                html: '/download/html/listing/subsidiary',
                csv: '/download/csv/listing/subsidiary',
            },

            // references
            controlsRef: null,
            regSubsidiaryRef: null,
            subControlsRef: null,
            subsidiaryRef: null,
            projectRef: null,
        }
    },
    methods: {

    },
    components: {
        downloadSheetModel
    }
}