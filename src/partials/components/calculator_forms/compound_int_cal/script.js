import func from '../../../../../custom_libs/func'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;
    },
    data: function(){
        return {
            init_invest: '',
            monthly_add: '',
            interest_rate: '',
            payments_time: '',
        }
    },
    validators: {
        'init_invest': function (value) {
            return Validator.value(value).required().greaterThan(0, 'Greater than 0!');
        },
        'monthly_add': function (value) {
            return Validator.value(value).required().greaterThan(0, 'Greater than 0!');
        },
        'interest_rate': function (value) {
            return Validator.value(value).required().greaterThan(0, 'Greater than 0!');
        },
        'payments_time': function (value) {
            return Validator.value(value).required().greaterThan(0, 'Greater than 0!');
        },

    },
    watch: {
        init_invest: function (val) {
            this.init_invest = func.isNumber(val, 10, '');
        },
        monthly_add: function (val) {
            this.monthly_add = func.isNumber(val, 10, '');
        },
        interest_rate: function (val) {
            this.interest_rate = func.isNumber(val, 2, '');
        },
        payments_time: function (val) {
            this.payments_time = func.isNumber(val, 2, '');
        },
    },
    methods: {
        resetFields: function () {
            let self = this;
            self.init_invest = '';
            self.monthly_add = '';
            self.interest_rate = '';
            self.payments_time = '';
            self.validation.reset();
            self.$emit('calculate', {});
        },
        calculate: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    let i = self.interest_rate;
                    if (i > 1.0) {i = self.interest_rate / 100} else {i = self.interest_rate}
                    i /= 12;
                    let ma = eval(self.monthly_add);
                    let prin = eval(self.init_invest);
                    let pmts = eval(self.payments_time * 12);
                    let count = 0;

                    while(count < pmts) {
                        let newprin = prin + ma;
                        prin = (newprin * i) + eval(prin + ma);
                        count = count + 1;
                    }

                    let totinv = eval(count * ma) + eval(self.init_invest);
                    let future_value = Number(prin).toFixed(2);
                    let total_interest = Number(eval(prin - totinv)).toFixed(2);

                    self.$emit('calculate', {
                        result: {
                            fv: future_value,
                            totInt: total_interest
                        },
                        data: self.grabCalFields()
                    });
                }
            });
        },
        grabCalFields: function () {
            let self = this;
            let grabData = {};
            grabData['init_invest'] = self.init_invest;
            grabData['monthly_add'] = self.monthly_add;
            grabData['interest_rate'] = self.interest_rate;
            grabData['payments_time'] = self.payments_time;
            return grabData;
        }
    },
}
