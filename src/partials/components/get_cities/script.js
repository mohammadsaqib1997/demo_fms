import VueTypeahead from 'vue-typeahead'
import func from '../../../../custom_libs/func'
import SimpleVueValidation from 'simple-vue-validator'

const Validator = SimpleVueValidation.Validator;

export default {
    extends: VueTypeahead,

    created: function () {
        let self = this;
    },
    props: ["label_con", "full_width"],
    data: function(){
        return {
            src: "/gapi",
            queryParamName: 'input'
        }
    },
    validators: {
        query: function (value) {
            return Validator.value(value).required().lengthBetween(6, 100);
        }
    },
    methods: {
        validate: function(callback) {
            return this.$validate()
                .then(function(success) {
                    callback(success);
                });
        },
        reset_items: function () {
            this.items = [];
        },
        onHit (item) {
            if(item){
                this.query = item.terms[0].value;
                this.items = [];
            }
        },
        prepareResponseData (data) {
            let search_val = this.query;
            let pred_data = data.predictions;
            let keys = Object.keys(pred_data);
            let match = ["locality", "political", "geocode"];
            let grabData = [];
            keys.forEach(function (key) {
                let item = pred_data[key];
                let val = item.terms[0].value;
                if(func.compareArr(match, item.types) && val.toLowerCase().indexOf(search_val.toLowerCase()) > -1){
                    grabData.push(item);
                }
            });
            return grabData;
        }
    }
}