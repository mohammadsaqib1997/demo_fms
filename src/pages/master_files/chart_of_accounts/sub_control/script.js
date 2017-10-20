import firebase from 'firebase'
import SimpleVueValidation from 'simple-vue-validator'
import func from '../../../../../custom_libs/func'

import addProjectModal from '../../../../partials/components/modals/add_project/add_project.vue'
import proSelControlModal from '../../../../partials/components/modals/proj_sel_control/proj_sel_control.vue'
import proSelSubControlModal from '../../../../partials/components/modals/proj_sel_sub_control/proj_sel_sub_control.vue'
import addControlModal from '../../../../partials/components/modals/add_control/add_control.vue'
import addSubControlModal from '../../../../partials/components/modals/add_sub_control/add_sub_control.vue'
import addSubsidiaryModal from '../../../../partials/components/modals/add_subsidiary/add_subsidiary.vue'

const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_project', function (val, oldVal) {
            self.proSelContGet(val);
        });

        self.$watch('sel_control', function (val, oldVal) {
            self.contSelSubContGet(val);
        });

        self.$watch('sel_sub_control', function (val, oldVal) {
            self.loadDataSubCont(self.sel_project, val);
        });

        self.$watch('debit', function (val, oldVal) {
            self.debit = func.isNumber(val, 8);
        });

        self.$watch('credit', function (val, oldVal) {
            self.credit = func.isNumber(val, 8);
        });

        const db = firebase.database();
        self.projectsRef = db.ref('/projects');
        self.controlsRef = db.ref('/controls');
        self.subControlsRef = db.ref('/sub_controls');
        self.regControlsRef = db.ref('/reg_controls');
        self.regSubControlsRef = db.ref('/reg_sub_controls');

        self.projectsRef.on('value', function (proSnap) {
            let renderData = proSnap.val();
            if (renderData !== null) {
                self.proData = renderData;
            }else{
                self.proData = {};
            }
            self.dataLoad1 = false;
        });
    },
    data: function(){
        return {
            dbLoad: null,

            //loaders
            dataLoad1: true,
            dataLoad2: false,
            dataLoad3: false,
            dataLoad4: false,
            inProcess: false,

            // data save
            proData: {},
            controlData: {},
            subControlData: {},

            // references
            subControlsRef: null,
            controlsRef: null,
            projectsRef: null,
            regControlsRef: null,
            regSubControlsRef: null,

            // form fields
            sel_project: "",
            sel_control: "",
            sel_sub_control: "",
            debit: 0,
            credit: 0,
            errMain: "",
            sucMain: "",
        }
    },
    validators: {
        sel_project: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        },
        sel_sub_control: function (value) {
            return Validator.value(value).required().lengthBetween(20, 36);
        }
    },
    methods: {
        getObjId: func.getObjId,
        getObjKeyVal: func.getObjKeyVal,
        proSelContGet: function (pro_key) {
            let self = this;
            self.dataLoad2 = true;
            self.sel_control = "";
            self.controlData = {};
            if(pro_key !== ""){
                self.regControlsRef.child(pro_key).on('value', function (regContSnap) {
                    let regContData = regContSnap.val();
                    if(regContData !== null){
                        let keys = Object.keys(regContData);
                        self.sel_control = "";
                        self.controlData = {};
                        keys.forEach(function (key, ind, arr) {
                            let item = regContData[key];
                            self.controlsRef.child(item.key).once('value').then(function (conSnap) {
                                self.controlData[item.key] = conSnap.val();
                                if(ind === arr.length-1){
                                    self.controlData = func.sortObj(self.controlData, false);
                                    self.dataLoad2 = false;
                                }
                            });
                        });
                    }else{
                        self.dataLoad2 = false;
                    }
                });
            }else{
                self.dataLoad2 = false;
            }
        },
        contSelSubContGet: function (cont_key) {
            let self = this;
            self.dataLoad3 = true;
            self.sel_sub_control = "";
            self.subControlData = {};
            if(cont_key !== ""){
                self.regSubControlsRef.child(self.sel_project)
                    .orderByChild("cont_key")
                    .equalTo(cont_key)
                    .on('value', function (regSubContSnap) {
                        let data = regSubContSnap.val();
                        if(data !== null){
                            let keys = Object.keys(data);
                            self.sel_sub_control = "";
                            self.subControlData = {};
                            keys.forEach(function (row, ind, arr) {
                                let item = data[row];
                                self.subControlsRef.child(item.key).once('value').then(function (subConSnap) {
                                    self.subControlData[item.key] = subConSnap.val();
                                    if (ind === arr.length-1) {
                                        self.subControlData = func.sortObj(self.subControlData, false);
                                        self.dataLoad3 = false;
                                    }
                                });
                            });

                        }else{
                            self.dataLoad3 = false;
                        }
                    });
            }else{
                self.dataLoad3 = false;
            }
        },
        loadDataSubCont: function (pro_key, sub_cont_key) {
            let self = this;
            self.dataLoad4 = true;
            self.debit = 0;
            self.credit = 0;
            if(pro_key !== "" && sub_cont_key !== ""){
                self.regSubControlsRef.child(pro_key).orderByChild('key').equalTo(sub_cont_key).once('value').then(function (regSubContSnap) {
                    let data = regSubContSnap.val();
                    if(data !== null){
                        let keys = Object.keys(data);
                        self.debit = data[keys[0]].debit;
                        self.credit = data[keys[0]].credit;
                    }
                    self.dataLoad4 = false;
                });
            }else{
                self.dataLoad4 = false;
            }
        },
        updateSubContEntry: function () {
            let self = this;
            self.inProcess = true;
            self.$validate().then(function (success) {
                if (success) {
                    let id_gen = func.genInvoiceNo(self.controlData[self.sel_control].id, '00', 3)+func.genInvoiceNo(self.subControlData[self.sel_sub_control].id, '000', 4);
                    self.regSubControlsRef.child(self.sel_project+"/"+id_gen).update({
                        'debit': self.debit,
                        'credit': self.credit,
                        'createdAt': firebase.database.ServerValue.TIMESTAMP
                    }, function (err) {
                        if(err){
                            self.errMain = err.message;
                        }else{
                            self.errMain = "";
                            self.sucMain = "Successfully inserted sub control amount!";
                            self.sel_project = "";
                            self.sel_control = "";
                            self.sel_sub_control = "";
                            self.debit = 0;
                            self.credit = 0;
                            self.validation.reset();
                            setTimeout(function () {
                                self.sucMain = "";
                            }, 1500);
                        }
                        self.inProcess = false;
                    });
                }else{
                    self.inProcess = false;
                }
            });
        }
    },
    components: {
        addProjectModal,
        proSelControlModal,
        proSelSubControlModal,
        addControlModal,
        addSubControlModal,
        addSubsidiaryModal
    }
}