import VueTypeahead from 'vue-typeahead'
import func from '../../../../custom_libs/func'

export default {
    extends: VueTypeahead,

    created: function () {
        let self = this;

        self.src = "/api/get_subs_name?project="+self.project;
        self.query = self.selected;
    },
    watch: {
        selected: function (val) {
            this.query = val;
        },
        project: function (val) {
            this.src = "/api/get_subs_name?project="+val;
            this.$emit('name_change', {code: "", name: ""});
            this.selected = "";
            this.reset_items();
        },
        name: function (val) {
            this.query = this.selected = val;
        }
    },
    props: ['project', 'name'],
    data: function(){
        return {
            src: "/api/get_subs_name",
            queryParamName: 'input',
            selected: this.name
        }
    },
    methods: {
        blur_reset: function () {
            if(this.query !== ""){
                this.reset_items();
            }else{
                this.$emit('name_change', {code: "", name: ""});
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
                this.selected = item.name;
                this.reset_items();
            }
        },
        prepareResponseData (data) {
            let grabData = [];
            if(data !== null){
                let hits = data;
                if(hits.length > 0){
                    hits.forEach(function (hit) {
                        let source = hit._source;
                        grabData.push(source);
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