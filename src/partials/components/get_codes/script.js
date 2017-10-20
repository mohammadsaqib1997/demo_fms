import VueTypeahead from 'vue-typeahead'
import func from '../../../../custom_libs/func'

export default {
    extends: VueTypeahead,

    created: function () {
        let self = this;

        self.src = "/api/get_codes?project="+self.project;
        self.query = self.selected;
    },
    watch: {
        selected: function (val) {
            this.query = val;
        },
        project: function (val) {
            this.src = "/api/get_codes?project="+val;
            this.$emit('name_change', {code: "", sub_name: ""});
            this.selected = "";
            this.reset_items();
        },
        code: function (val) {
            this.query = this.selected = val;
        },
    },
    props: ['project', 'code'],
    data: function(){
        return {
            src: "/api/get_codes",
            queryParamName: 'input',
            selected: this.code
        }
    },
    methods: {
        blur_reset: function () {
            if(this.query !== ""){
                this.reset_items();
            }else{
                this.$emit('name_change', {code: "", sub_name: ""});
                this.query = this.selected = "";
            }
        },
        reset_items: function () {
            this.query = this.selected;
            this.items = [];
        },
        onHit (item) {
            if(item){
                this.$emit('name_change', item);
                this.selected = item.code;
                this.reset_items();
            }
        },
        prepareResponseData (data) {
            let grabData = [];
            if(data !== null){
                let hits = data.hits.hits;
                if(hits.length > 0){
                    let source = hits[0]._source;
                    let codes = Object.keys(source);
                    codes.forEach(function (code) {
                        let item = source[code];
                        item['code'] = code;
                        grabData.push(item);
                    });
                }
            }
            return grabData;
        },
        checkPro: function (e) {
            let self = this;
            if(self.project === ""){
                e.preventDefault();
                alert("Please Select Project!");
            }else{
                if(e.keyCode === 120){
                    e.preventDefault();
                    self.$emit("list_subs_pro_id");
                }
            }
        }
    }
}