import firebase from 'firebase'
import func from '../../../../../custom_libs/func'

export default {
    props: {
        cal_key: {
            type: String,
            default: ''
        }
    },
    created: function () {
        let self = this;

        const db = firebase.database();
        self.saveCalRef = db.ref('/save_calculators');

    },
    watch: {
        cal_key: function (val) {
            this.loadView(val);
        }
    },
    data: function(){
        return {
            load1: true,

            saveCalRef: null,

            loadData: null
        }
    },
    methods: {
        loadView: function (key) {
            let self = this;
            self.load1 = true;
            self.saveCalRef.child(key).once('value', function(snap){
                let data = snap.val();
                if(data !== null){
                    self.loadData = data;
                }else{
                    self.loadData = null;
                }
                self.load1 = false;
            });
        }
    }
}
