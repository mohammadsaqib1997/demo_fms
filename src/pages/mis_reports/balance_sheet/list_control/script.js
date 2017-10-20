import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import func from '../../../../../custom_libs/func'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_project', function (val, oldVal) {
            self.validCheck();
        });
        self.$watch('start_date', function (val, oldVal) {
            self.validCheck();
        });
        self.$watch('end_date', function (val, oldVal) {
            self.validCheck();
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            } else {
                self.proData = {};
            }
            self.dataLoad1 = false;
        });

        setTimeout(function () {
            $(function(){
                $(".datepicker").datepicker().on('change', function(e) {
                    let grabField = $(e.target);
                    if(grabField.hasClass('start_date')){
                        self.start_date = new Date(grabField.val()).getTime();
                    }
                    if(grabField.hasClass('end_date')){
                        self.end_date = new Date(grabField.val()).getTime();
                    }
                });
            });
        }, 100);
    },
    data: function () {
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            validForm: false,
            anchURL: '',

            // data save
            proData: {},

            // references
            projectsRef: null,

            // form fields
            sel_project: "",
            start_date: "",
            end_date: "",
        }
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        start_date: function (value) {
            return Validator.value(value).required().digit("Invalid Date!").maxLength(20, "Invalid Date!");
        },
        end_date: function (value) {
            return Validator.value(value).required().digit("Invalid Date!").maxLength(20, "Invalid Date!");
        }
    },
    methods: {
        validCheck: function () {
            let self = this;
            self.anchURL = '';
            self.$validate().then(function (success) {
                if (success) {
                    self.validForm = true;
                    self.anchURL = '/sheet/bs_control/'+self.sel_project+"/"+self.start_date+"/"+self.end_date;
                }else{
                    self.validForm = false;
                }
            });
        }
    }
}