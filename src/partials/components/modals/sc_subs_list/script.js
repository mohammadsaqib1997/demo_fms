import firebase from 'firebase'
import func from '../../../../../custom_libs/func'

export default {
    props: ['pro_key'],
    created: function () {
        let self = this;

        const db = firebase.database();
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.subsidiaryRef = db.ref('/subsidiary');

    },
    watch: {
        pro_key: function (val) {
            this.loadList(val);
        }
    },
    data: function(){
        return {
            load1: true,

            regSubsidiaryRef: null,
            subsidiaryRef: null,

            loadData: null
        }
    },
    methods: {
        loadList: function (val) {
            let self = this;
            if(val !== ""){
                self.load1 = true;
                self.regSubsidiaryRef.child(val).once('value', function(snap){
                    let data = snap.val();
                    if(data !== null){
                        let process_item = 0;
                        self.loadData = {};
                        snap.forEach(function (regSubSnap) {
                            let row = regSubSnap.val();
                            self.subsidiaryRef.child(row.key).once('value', function (subsSnap) {
                                row['name'] = subsSnap.val().name;
                                self.loadData[regSubSnap.key] = row;

                                process_item++;
                                if(snap.numChildren() === process_item){
                                    self.load1 = false;
                                }
                            });
                        });
                    }else{
                        self.loadData = null;
                        self.load1 = false;
                    }
                });
            }else{
                self.loadData = null;
                self.load1 = false;
            }
        },
        selSub: function (key) {
            let self = this;
            $("#proSubsList").modal("hide");
            self.$emit("get_subs_item", {code: key, sub_name: self.loadData[key].name});
        }
    }
}
