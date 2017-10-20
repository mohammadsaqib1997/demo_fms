import firebase from 'firebase'

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.partyInformationRef = db.ref('/party_information');
        self.partyInfoCatRef = db.ref('/party_info_cat');

        self.partyInformationRef.child(self.$route.params.id).once('value', function (piSnap) {
            self.piData = piSnap.val();
            if(self.piData !== null){
                self.partyInfoCatRef.child(self.piData.sel_category).once('value', function (piCatSnap) {
                    let piCatData = piCatSnap.val();
                    self.piData['sel_category'] = piCatData.name;
                    self.dataLoad1 = false;
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
            piData: null,

            // references
            partyInformationRef: null,
            partyInfoCatRef: null,
        }
    },
    methods: {

    }
}