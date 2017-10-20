import firebase from 'firebase'
import moment from 'moment'

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.masterDetailsRef = db.ref('/master_details');
        self.projectsRef = db.ref('/projects');
        self.projectTypesRef = db.ref('/project_types');
        self.projectTypeItemsRef = db.ref('/project_type_items');
        self.brokersRef = db.ref('/brokers');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');

        self.masterDetailsRef.child(self.$route.params.id).once('value', function (mdSnap) {
            self.mdData = mdSnap.val();
            if(self.mdData !== null){

                self.projectsRef.child(self.mdData.sel_project).once('value', function (proSnap) {
                    let proData = proSnap.val();
                    self.mdData['sel_project'] = proData.name;

                    self.projectTypesRef.child(self.mdData.sel_type).once('value', function (proTypeSnap) {
                        let proTypeData = proTypeSnap.val();
                        self.mdData['sel_type'] = proTypeData.name;

                        self.projectTypeItemsRef.child(self.mdData.sel_pro_type_no).once('value', function(proTypeItemSnap){
                            let proTypeItemData = proTypeItemSnap.val();
                            self.mdData['sel_pro_type_no'] = proTypeItemData.name;

                            self.brokersRef.child(self.mdData.sel_broker).once('value', function (brokerSnap) {
                                let brokerData = brokerSnap.val();
                                self.mdData['sel_broker'] = brokerData.name;

                                self.vouchersEntriesRef.orderByChild('v_key').equalTo(mdSnap.key).once('value', function (entsSnap) {
                                    if(entsSnap.numChildren() > 0){
                                        self.entsData = entsSnap.val();
                                    }

                                    self.mdData['booking_date'] = moment(self.mdData.booking_date).format("DD/MM/YYYY");
                                    self.dataLoad1 = false;
                                });
                            });
                        });
                    });
                });
            }else{
                self.dataLoad1 = false;
            }
        });
    },
    data: function () {
        return {
            //loaders
            inProcess: false,
            dataLoad1: true,

            // data save
            mdData: null,
            entsData: {},

            // references
            masterDetailsRef: null,
            projectsRef: null,
            projectTypesRef: null,
            projectTypeItemsRef: null,
            brokersRef: null,
            vouchersEntriesRef: null,
        }
    },
    methods: {

    }
}