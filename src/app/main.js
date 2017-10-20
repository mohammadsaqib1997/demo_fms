import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from "vue-resource"
// import VueSession from "vue-session"
import VueLocalStorage from 'vue-ls'
import SimpleVueValidation from 'simple-vue-validator'
import firebase from 'firebase'
import cryptoJSON from 'crypto-json'

import config_fb from '../../config/client_private.json'
firebase.initializeApp(config_fb.config_fb);

import routes from './routes'

Vue.use(VueLocalStorage);
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(SimpleVueValidation);



const router = new VueRouter({
    mode: 'history',
    routes
});

new Vue({
    router,
    created: function () {
        let self = this;
        const db = firebase.database();
        self.usersRef = db.ref('/users');

        if(!self.routeCond){
            self.routeCond = true;
            self.$router.beforeEach(function (to, from, next) {
                let route = to.path;
                if(!self.isLockUser()){
                    if(route !== "/lock_account"){
                        if(to.matched.some((rec)=>rec.meta.requiresAuth)){
                            if(self.loginUData !== null){
                                if(to.matched.some((rec)=>rec.meta.admin)){
                                    if(self.loginUData.type === "admin"){
                                        next();
                                    }else{
                                        self.$router.push('/');
                                    }
                                }else{
                                    next();
                                }
                            }else{
                                self.$router.push('/login');
                            }
                        }else{
                            if(route === "/login"){
                                if(self.loginUData === null){
                                    next();
                                }else{
                                    self.$router.push('/');
                                }
                            }else{
                                next();
                            }
                        }
                    }else{
                        self.$router.push('/');
                    }
                }else{
                    if(route !== "/lock_account"){
                        self.$router.push('/lock_account');
                    }else{
                        next();
                    }
                }
            });
        }

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                self.loginUID = user.uid;
            } else {
                self.$ls.remove('loginUser');
                self.compileProc = false;
                self.loginUID = "";
                self.loginUData = null;
                self.$router.push('/login');
            }
        });
    },
    data: {
        csrf: '',
        secKey: config_fb.config_fb.apiKey,
        userLoginEmit: false,
        loginUID: "",
        loginUData: null,
        loadImgSrc: "",
        usersRef: null,
        compileProc: true,
        routeCond: false,
    },
    watch: {
        loginUID: function (val) {
            this.loginUserLoad(val);
        },
        loginUData: function (val) {
            let self = this;

            let checkRouteAuth = self.$route.matched.some(function (record) {
                return record.meta.requiresAuth;
            });
            let checkRouteAdmin = self.$route.matched.some(function (record) {
                return record.meta.admin;
            });
            let route = self.$route.path;
            self.compileProc = false;
            if(!self.isLockUser()){
                if(route !== "/lock_account"){
                    if(checkRouteAuth){
                        if(val === null){
                            self.$router.push('/login');
                        }else{
                            if(checkRouteAdmin){
                                if(val.type !== "admin"){
                                    self.$router.push('/');
                                }
                            }
                        }
                    }else{
                        if(route === "/login"){
                            if(val !== null){
                                self.$router.push('/');
                            }
                        }
                    }
                }else{
                    self.$router.push('/');
                }
            }else{
                if(route !== "/lock_account"){
                    self.$router.push('/lock_account');
                }
            }
        }
    },
    beforeMount: function () {
        this.csrf = this.$el.attributes.csrf.value;
    },
    mounted: function(){
        this.$ls.on('loginUser', function (val, oldVal, uri) {
            if(val === null){
                firebase.auth().signOut();
            }
        });
    },
    methods: {
        isNumber: function (val, maxLength) {
            if (val !== "") {
                if (isNaN(val)) {
                    return val.substr(0, val.toString().length-1);
                } else {
                    if (val > maxLength) {
                        return val.substr(0, val.toString().length-1);
                    } else {
                        return val * 1;
                    }
                }
            } else {
                return 0;
            }
        },
        trim: function (val) {
            if(val.charAt(0) === " "){
                val = val.substr(1, val.length);
            }
            return val.replace(/\s{2,}/g, ' ');
        },
        loginUserLoad: function (uid) {
            let self = this;
            if(uid !== ""){
                self.compileProc = true;
                self.usersRef.child(uid).on("value", function (snap) {
                    let item = snap.val();
                    item["uid"] = uid;
                    self.loginUData = item;
                });
            }else{
                self.loginUData = null;
            }
        },
        isLockUser: function () {
            let self = this;
            if(self.$ls.get('loginUser')){
                let encObj = self.$ls.get('loginUser');
                let userObj = cryptoJSON.decrypt(encObj, self.secKey, { keys: [] });
                return userObj.lock;
            }
            return false;
        },
        userSaveLS: function (email, password, uid) {
            let self = this;
            let userObj = {
                uid: uid,
                email: email,
                password: password,
                lock: false,
            };
            let encrypted = cryptoJSON.encrypt(userObj, self.secKey, { keys: [] });
            self.$ls.set('loginUser', encrypted);
        }
    }
}).$mount("#app");