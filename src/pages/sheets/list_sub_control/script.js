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
        self.regSubControlsRef = db.ref('/reg_sub_controls');

        self.projectRef.child(params.proId).on('value', function (proSnap) {
            let renderData = proSnap.val();
            if(renderData !== null){
                self.optionalData.proName = renderData.name;

                self.regSubControlsRef.child(params.proId).orderByKey().startAt(bw[0]).endAt(bw[1]).once('value').then(function (regSubContSnap) {
                    let regSubContData = regSubContSnap.val();
                    if(regSubContData !== null){
                        let ids = Object.keys(regSubContData);
                        let ids_length = ids.length;
                        let process_item = 0;
                        let grabData = {};
                        let contDataObj = {};
                        let subContDataArr = [];
                        ids.forEach(function (id) {
                            let row = regSubContData[id];
                            self.subControlsRef.child(row.key).once('value').then(function (subContSnap) {
                                let subContData = subContSnap.val();
                                subContData['id'] = func.genInvoiceNo(subContData.id, '000', 4);
                                self.controlsRef.child(subContData.cont_key).once('value').then(function (contSnap) {
                                    let contData = contSnap.val();

                                    subContData['cont_id'] = func.genInvoiceNo(contData.id, '00', 3);
                                    subContDataArr.push(subContData);

                                    contData['id'] = subContData.cont_id;
                                    contDataObj[contData.id] = contData;

                                    process_item++;
                                    if(ids_length === process_item) {
                                        subContDataArr = func.sortObjByVal(subContDataArr, 'id');
                                        grabData = {
                                            cont_data: contDataObj,
                                            sub_cont_data: subContDataArr
                                        };
                                        self.fetchData = grabData;
                                        self.dataLoad1 = false;
                                    }
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
                subTitle: 'SUB-CONTROL LISTING',
                proName: '',
                date: moment().format('DD/MM/YYYY'),
            },
            dLinks: {
                pdf: '/download/pdf/listing/sub_control',
                html: '/download/html/listing/sub_control',
                csv: '/download/csv/listing/sub_control',
            },

            // references
            controlsRef: null,
            regSubControlsRef: null,
            subControlsRef: null,
            projectRef: null,
        }
    },
    methods: {

    },
    components: {
        downloadSheetModel
    }
}