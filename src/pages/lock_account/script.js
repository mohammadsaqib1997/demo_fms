import firebase from 'firebase'
import cryptoJSON from 'crypto-json'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        this.userRef = firebase.database().ref('users');
        this.lsLoad();
    },
    data: function () {
        return {
            mainErr: '',
            pro_img_src: '',
            name: '',
            loadImg: true,
            email: '',
            password: '',
            isProcess: false,
            userRef: null
        }
    },
    validators: {
        password: function (value) {
            this.mainErr = "";
            return Validator.value(value).required();
        }
    },
    methods: {
        unLock: function () {
            let self = this;
            self.isProcess = true;
            self.mainErr = "";
            self.$validate().then(function (success) {
                if (success) {
                    if(self.matchPass(self.password)){
                        $("#page-load").css({"display": "block"});
                        let encObj = self.$ls.get('loginUser');
                        let userObj = cryptoJSON.decrypt(encObj, self.$root.secKey, { keys: [] });
                        userObj['lock'] = false;
                        let encrypted = cryptoJSON.encrypt(userObj, self.$root.secKey, { keys: [] });
                        self.$ls.set('loginUser', encrypted);
                        self.$router.push('/');
                    }else{
                        self.mainErr = "Password not match!";
                    }
                    self.isProcess = false;
                }else{
                    self.isProcess = false;
                }
            });
        },
        lsLoad: function () {
            let self = this;
            if(self.$ls.get('loginUser')){
                let encObj = self.$ls.get('loginUser');
                let userObj = cryptoJSON.decrypt(encObj, self.$root.secKey, { keys: [] });
                self.email = userObj.email;
                self.userRef.child(userObj.uid).once('value', function (userSnap) {
                    let userData = userSnap.val();
                    self.name = userData.first_name+" "+userData.last_name;
                    self.imageLoad(userObj.uid);
                });
            }
        },
        matchPass: function (pass) {
            let self = this;
            if(self.$ls.get('loginUser')){
                let encObj = self.$ls.get('loginUser');
                let userObj = cryptoJSON.decrypt(encObj, self.$root.secKey, { keys: [] });
                if(userObj.password === pass){
                    return true;
                }
            }
            return false;
        },
        imageLoad: function (uid) {
            let self = this;
            const storage = firebase.storage();
            let ref = storage.ref('profile_images/' + uid + '.jpg');
            ref.getDownloadURL().then(function (url) {
                self.pro_img_src = url;
                self.loadImg = false;
            }, function (err) {
                self.pro_img_src = "/assets/images/avatar-1.jpg";
                self.loadImg = false;
            });
        },
    }
}