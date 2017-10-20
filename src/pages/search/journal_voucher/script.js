import firebase from 'firebase'
import moment from 'moment'

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.vouchersRef = db.ref('/vouchers');
        self.projectsRef = db.ref('/projects');
        self.masterDetailsRef = db.ref('/master_details');
        self.partyInformationRef = db.ref('/party_information');
        self.vouchersEntriesRef = db.ref('/vouchers_entries');

        self.vouchersRef.child(self.$route.params.id).once('value', function (jvSnap) {
            self.jvData = jvSnap.val();
            if(self.jvData !== null){

                self.projectsRef.child(self.jvData.sel_project).once('value', function (proSnap) {
                    let proData = proSnap.val();
                    self.jvData['sel_project'] = proData.name;
                    self.jvData['voucher_date'] = moment(self.jvData.voucher_date).format("DD/MM/YYYY");

                    if(self.jvData.ref_key !== ""){
                        if(self.jvData.ref_type === "md"){
                            self.masterDetailsRef.child(self.jvData.ref_key).once('value', function (mdSnap) {
                                let mdData = mdSnap.val();
                                self.jvData['ref_key'] = mdData.id+" | "+mdData.allotee_name;
                                self.loadEnt(self, jvSnap.key);
                            });
                        }else if(self.jvData.ref_type === "pi"){
                            self.partyInformationRef.child(self.jvData.ref_key).once('value', function (piSnap) {
                                let piData = piSnap.val();
                                self.jvData['ref_key'] = piData.id+" | "+piData.agent_name;
                                self.loadEnt(self, jvSnap.key);
                            });
                        }else{
                            self.loadEnt(self, jvSnap.key);
                        }
                    }else{
                        self.loadEnt(self, jvSnap.key);
                    }
                });
            }else{
                self.dataLoad1 = false;
            }
        });
    },
    data: function () {
        return {
            //loaders
            dataLoad1: true,

            // data save
            jvData: null,
            entsData: {},

            // references
            vouchersRef: null,
            projectsRef: null,
            masterDetailsRef: null,
            partyInformationRef: null,
            vouchersEntriesRef: null,
        }
    },
    methods: {
        loadEnt: function (self, key) {
            self.vouchersEntriesRef.orderByChild('v_key').equalTo(key).once('value', function (entsSnap) {
                if(entsSnap.numChildren() > 0){
                    self.entsData = entsSnap.val();
                }
                self.dataLoad1 = false;
            });
        }
    }
}