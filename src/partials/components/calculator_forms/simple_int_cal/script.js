import func from '../../../../../custom_libs/func'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;
        self.checkVisibleField();
    },
    data: function(){
        return {
            int_sel_data: [
                {
                    ref: 'find_A',
                    title: 'Total P+I (A)'
                },
                {
                    ref: 'find_P',
                    title: 'Principal (P)'
                },
                {
                    ref: 'find_r',
                    title: 'Rate (R)'
                },
                {
                    ref: 'find_t',
                    title: 'Time Period (t)'
                },
            ],
            t_unit_data: [
                {
                    val: 'day_365',
                    title: 'days (365/Yr)',
                    formula: ''
                },
                {
                    val: 'day_360',
                    title: 'days (360/Yr)',
                    formula: ''
                },
                {
                    val: 'week',
                    title: 'weeks',
                    formula: ''
                },
                {
                    val: 'month',
                    title: 'months',
                    formula: ''
                },
                {
                    val: 'quarter',
                    title: 'quarters',
                    formula: ''
                },
                {
                    val: 'year',
                    title: 'years',
                    formula: ''
                }
            ],
            int_sel_formulas: {
                find_A: 'A = P(1 + rt)',
                find_P: 'P = A / (1 + rt)',
                find_r: 'r = (1/t)(A/P - 1)',
                find_t: 't = (1/r)(A/P - 1)',
            },
            interest_select: 0,
            saveData: {
                find_r : 0,
                find_y_d: 1
            },
            fields: {
                a: '',
                p: '',
                r: '',
                t: '',
                t_unit: '',
            },
            v_fields: {
                a: true,
                p: true,
                r: true,
                t: true,
                t_unit: true,
            }

        }
    },
    validators: {
        'fields.a': function (value) {
            if(this.v_fields.a){
                return Validator.value(value).required();
            }
        },
        'fields.p': function (value) {
            if(this.v_fields.p){
                return Validator.value(value).required();
            }
        },
        'fields.r': function (value) {
            if(this.v_fields.r){
                return Validator.value(value).required();
            }
        },
        'fields.t': function (value) {
            if(this.v_fields.t){
                return Validator.value(value).required().greaterThan(0, 'Greater than 0!');
            }
        },
        'fields.t_unit': function (value) {
            if(this.v_fields.t_unit){
                return Validator.value(value).required();
            }
        },
    },
    watch: {
        interest_select: function (val) {
            this.checkVisibleField();
            this.resetFields();
        },
        'fields.a': function (val) {
            this.fields.a = func.isNumber(val, 10, '');
        },
        'fields.p': function (val) {
            this.fields.p = func.isNumber(val, 10, '');
        },
        'fields.r': function (val) {
            this.fields.r = func.isNumber(val, 4, '');
            this.saveData.find_r = (this.fields.r !== '') ? Number(this.fields.r/100).toFixed(2): '';
        },
        'fields.t': function (val) {
            this.fields.t = func.isNumber(val, 4, '');
        },
        'fields.t_unit': function (val) {
            if(val === 'day_365'){
                this.saveData.find_y_d = 365;
            }else if(val === 'day_360'){
                this.saveData.find_y_d = 360;
            }else if(val === 'week'){
                this.saveData.find_y_d = 52;
            }else if(val === 'month'){
                this.saveData.find_y_d = 12;
            }else if(val === 'quarter'){
                this.saveData.find_y_d = 4;
            }else{
                this.saveData.find_y_d = 1;
            }
        }
    },
    methods: {
        checkVisibleField: function () {
            let self = this;
            let int_sel = self.interest_select;
            let int_data = self.int_sel_data;
            let v_fields = self.v_fields;

            v_fields.a = false;
            v_fields.p = false;
            v_fields.r = false;
            v_fields.t = false;
            v_fields.t_unit = false;

            if(int_data[int_sel].ref === 'find_A'){
                v_fields.p = true;
                v_fields.r = true;
                v_fields.t = true;
                v_fields.t_unit = true;
            }else if(int_data[int_sel].ref === 'find_P'){
                v_fields.a = true;
                v_fields.r = true;
                v_fields.t = true;
                v_fields.t_unit = true;
            }else if(int_data[int_sel].ref === 'find_r'){
                v_fields.a = true;
                v_fields.p = true;
                v_fields.t = true;
                v_fields.t_unit = true;
            }else if(int_data[int_sel].ref === 'find_t'){
                v_fields.a = true;
                v_fields.p = true;
                v_fields.r = true;
            }
        },
        resetFields: function (all) {
            let self = this;
            if(typeof all !== 'undefined'){
                if(all){
                    self.interest_select = 0;
                }
            }
            self.fields.a = '';
            self.fields.p = '';
            self.fields.r = '';
            self.fields.t = '';
            self.fields.t_unit = '';
            self.validation.reset();
            self.$emit('calculate', {});
        },
        calculate: function () {
            let self = this;
            let int_sel = self.interest_select;
            let int_data = self.int_sel_data;
            let fields = self.fields;
            self.$validate().then(function (success) {
                if (success) {
                    let saveRes = 0;
                    if(int_data[int_sel].ref === 'find_A'){
                        saveRes = fields.p*(1 + self.saveData.find_r*Number(fields.t/self.saveData.find_y_d).toFixed(2));
                        saveRes = Number(saveRes).toFixed(2);

                    }else if(int_data[int_sel].ref === 'find_P'){
                        saveRes = fields.a/(1 + self.saveData.find_r*Number(fields.t/self.saveData.find_y_d).toFixed(2));
                        saveRes = Number(saveRes).toFixed(2);

                    }else if(int_data[int_sel].ref === 'find_r'){
                        saveRes = ((1/fields.t)*((fields.a/fields.p) - 1))*100;
                        saveRes = Number(saveRes).toFixed(4);

                    }else if(int_data[int_sel].ref === 'find_t'){
                        saveRes = (1/self.saveData.find_r)*((fields.a/fields.p) - 1);
                        saveRes = Number(saveRes).toFixed(2);
                    }

                    self.$emit('calculate', {
                        result: saveRes,
                        data: self.grabCalFields()
                    });
                }
            });
        },
        grabCalFields: function(){
            let self = this;
            let grabData = {};
            let int_sel = self.interest_select;
            let int_data = self.int_sel_data;
            let fields = self.fields;

            grabData['sol_for'] = int_sel;
            grabData['formula'] = self.int_sel_formulas[int_data[int_sel].ref];

            if(int_data[int_sel].ref === 'find_A'){
                grabData['p'] = fields.p;
                grabData['r'] = fields.r;
                grabData['t'] = fields.t;
                grabData['t_unit'] = fields.t_unit;
            }else if(int_data[int_sel].ref === 'find_P'){
                grabData['a'] = fields.a;
                grabData['r'] = fields.r;
                grabData['t'] = fields.t;
                grabData['t_unit'] = fields.t_unit;
            }else if(int_data[int_sel].ref === 'find_r'){
                grabData['a'] = fields.a;
                grabData['p'] = fields.p;
                grabData['t'] = fields.t;
                grabData['t_unit'] = fields.t_unit;
            }else if(int_data[int_sel].ref === 'find_t'){
                grabData['a'] = fields.a;
                grabData['p'] = fields.p;
                grabData['r'] = fields.r;
            }
            return grabData;
        }
    },
}

//find_A visible fields
// p, r, t

//find_P visible fields
// a, r, t

//find_r visible fields
// a, p, t

//find_t visible fields
// a, p, r
