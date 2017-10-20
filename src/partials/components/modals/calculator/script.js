import firebase from 'firebase'
import func from '../../../../../custom_libs/func'
import simpleIntCal from '../../calculator_forms/simple_int_cal/calculator.vue'
import compoundIntCal from '../../calculator_forms/compound_int_cal/calculator.vue'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.saveCalRef = db.ref('/save_calculators');

        self.saveCalRef.orderByChild('type').equalTo('sc').on('value', function(snap){
            if(snap.val() !== null){
                self.simCalData = func.sortObj(snap.val());
            }else{
                self.simCalData = {};
            }
            self.load1 = false;
        });
        self.saveCalRef.orderByChild('type').equalTo('cc').on('value', function(snap){
            if(snap.val() !== null) {
                self.comCalData = func.sortObj(snap.val());
            }else{
                self.comCalData = {};
            }
            self.load2 = false;
        });
    },
    data: function(){
        return {
            load1: true,
            load2: true,

            saveSimCalProcess: false,
            saveSimCal: false,
            saveSimCalErr: '',
            saveSimCalMsg: '',
            saveSimCalName: '',
            saveSimCalData: {},
            simple_res: Number(0).toFixed(2),
            simCalData: {},

            saveComCalProcess: false,
            saveComCalErr: '',
            saveComCalMsg: '',
            saveComCalName: '',
            saveComCalData: {},
            saveComCal: false,
            comp_fv_res: Number(0).toFixed(2),
            comp_iv_res: Number(0).toFixed(2),
            comCalData: {},

            saveCalRef: null
        }
    },
    validators: {
        saveSimCalName: function (value) {
            if(this.saveSimCal){
                return Validator.value(value).required().lengthBetween(3, 50);
            }
        },
        saveComCalName: function (value) {
            if(this.saveComCal){
                return Validator.value(value).required().lengthBetween(3, 50);
            }
        },
    },
    methods: {
        showSimpleResult: function (res) {
            this.saveSimCalData = res;
            if(this.saveSimCalData.hasOwnProperty('result')){
                this.simple_res = res.result;
            }else{
                this.simple_res = Number(0).toFixed(2);
            }
        },
        saveSimpleResult: function(){
            let self = this;
            self.saveComCal = false;
            self.saveSimCal = true;
            self.saveSimCalErr = '';
            self.$validate().then(function (success) {
                if(success){
                    if(self.saveSimCalData.hasOwnProperty('result')){
                        self.saveSimCalProcess = true;
                        self.saveCalRef.push({
                            type: 'sc',
                            label: self.saveSimCalName,
                            result: self.saveSimCalData.result,
                            data: self.saveSimCalData.data,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        }, function(err){
                            if (err) {
                                self.saveSimCalErr = err.message;
                                console.log(err);
                            } else {
                                self.saveSimCalName = '';
                                self.validation.reset();
                                self.saveSimCalMsg = "Successfully insertion!";
                                setTimeout(function(){
                                    self.saveSimCalMsg = '';
                                }, 1500);
                            }
                            self.saveSimCalProcess = false;
                        });

                    }else{
                        self.saveSimCalErr = 'Required Calculation!'
                    }
                }
            });
        },
        showCompoundResult: function (res) {
            this.saveComCalData = res;
            if(this.saveComCalData.hasOwnProperty('result')){
                this.comp_fv_res = res.result.fv;
                this.comp_iv_res = res.result.totInt;
            }else{
                this.comp_fv_res = Number(0).toFixed(2);
                this.comp_iv_res = Number(0).toFixed(2);
            }
        },
        saveCompoundResult: function(){
            let self = this;
            self.saveSimCal = false;
            self.saveComCal = true;
            self.saveComCalErr = '';
            self.$validate().then(function (success) {
                if(success){
                    if(self.saveComCalData.hasOwnProperty('result')){
                        self.saveComCalProcess = true;
                        self.saveCalRef.push({
                            type: 'cc',
                            label: self.saveComCalName,
                            result: self.saveComCalData.result,
                            data: self.saveComCalData.data,
                            createdAt: firebase.database.ServerValue.TIMESTAMP
                        }, function(err){
                            if (err) {
                                self.saveComCalErr = err.message;
                                console.log(err);
                            } else {
                                self.saveComCalName = '';
                                self.validation.reset();
                                self.saveComCalMsg = "Successfully insertion!";
                                setTimeout(function(){
                                    self.saveComCalMsg = '';
                                }, 1500);
                            }
                            self.saveComCalProcess = false;
                        });

                    }else{
                        self.saveComCalErr = 'Required Calculation!'
                    }
                }
            });
        },
        deleteCalItem: function (key) {
            this.saveCalRef.child(key).remove(function (err) {
                if(err){
                    console.log(err);
                }
            });
        },
        send_key: function(key){
            this.$emit('send_key', key);
        }
    },
    components: {
        simpleIntCal,
        compoundIntCal
    }
}
