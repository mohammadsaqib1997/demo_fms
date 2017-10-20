import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import func from '../../../../custom_libs/func'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_project', function (val, oldVal) {
            self.loadRegSubsidiary(val);
        });

        self.$watch('sel_subsidiary', function (val, oldVal) {
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
        self.regSubsidiaryRef = db.ref('/reg_subsidiary');
        self.subsidiaryRef = db.ref('/subsidiary');

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
            dataLoad2: false,
            validForm: false,
            anchURL: '',

            // data save
            proData: {},
            regSubsData: {},

            // references
            projectsRef: null,
            regSubsidiaryRef: null,
            subsidiaryRef: null,

            // form fields
            sel_project: "",
            sel_subsidiary: "",
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
        },
        sel_subsidiary: function (value) {
            return Validator.value(value).required().lengthBetween(1, 20, "Invalid Id!");
        },
    },
    methods: {
        loadRegSubsidiary: function (sel_pro) {
            let self = this;
            self.dataLoad2 = true;
            self.sel_subsidiary = "";
            if(sel_pro !== ""){
                self.regSubsidiaryRef.child(sel_pro).on('value', function (regSubsSnap) {
                    let regSubsData = regSubsSnap.val();
                    if(regSubsData !== null){
                        let keys = Object.keys(regSubsData);
                        let process_item = 0;
                        keys.forEach(function (key) {
                            let item = regSubsData[key];
                            self.subsidiaryRef.child(item.key).once('value', function(subsSnap){
                                let subsData = subsSnap.val();
                                item['name'] = key+" | "+subsData.name;
                                self.regSubsData[key] = item;

                                process_item++;
                                if(process_item === keys.length){
                                    self.regSubsData = func.sortObj(self.regSubsData, false);
                                    self.dataLoad2 = false;
                                }
                            });
                        });
                    }else{
                        self.dataLoad2 = false;
                        self.regSubsData = {};
                    }
                });
            }else{
                self.dataLoad2 = false;
                self.regSubsData = {};
            }
        },
        validCheck: function () {
            let self = this;
            self.anchURL = '';
            self.$validate().then(function (success) {
                if (success) {
                    self.validForm = true;
                    self.anchURL = '/sheet/detail_ledger/'+self.sel_project+"/"+self.sel_subsidiary+"/"+self.start_date+"/"+self.end_date;
                }else{
                    self.validForm = false;
                }
            });
        }
    }
}