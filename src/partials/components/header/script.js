import firebase from 'firebase'
import func from '../../../../custom_libs/func'
import moment from 'moment'
import cryptoJSON from 'crypto-json'

export default {
    created: function () {
        let self = this;

        self.s_name = self.$root.loginUData.first_name + " " + self.$root.loginUData.last_name;
        self.imageLoad(self.$root.loginUData.uid);

        self.$watch(function () {
            return self.$root.loadImgSrc;
        }, function (val, oldVal) {
            if (val !== "") {
                self.pro_img_src = val;
            }
        });

        const db = firebase.database();
        self.masterDetailsData = db.ref('/master_details');
        self.vouchersRef = db.ref('/vouchers');

        self.masterDetailsData.once('value', function (mdSnap) {
            let mdData = mdSnap.val();
            if (mdData !== null) {
                let keys = Object.keys(mdData);
                let cur_date = moment();
                let process_item = 0;
                keys.forEach(function (key) {
                    let item = mdData[key];
                    if (item.posted_status === "Yes") {
                        let booking_date = moment(item.booking_date);

                        let grabDueDatesUnix = {};
                        let dueDate = booking_date.clone().set('date', 1);
                        for (let i = 0; i < item.payment_installment; i++) {
                            dueDate.add(1, "M");
                            if (cur_date.unix() >= dueDate.clone().add(1, 'M').subtract(7, 'days').unix() && cur_date.unix() <= dueDate.clone().add(1, 'M').unix()) {
                                grabDueDatesUnix = {
                                    start: dueDate,
                                    end: dueDate.clone().add(1, "M").subtract(1, 'days')
                                };
                                self.notiData[key] = "Receive Payment " + item.allotee_name + " -- " + item.allotee_code;
                                break;
                            }
                        }

                        self.vouchersRef.orderByChild('ref_key').equalTo(key).once('value', function (vSnap) {
                            if (vSnap.numChildren() > 0) {
                                let vData = vSnap.val();
                                let keys = Object.keys(vData);
                                keys.reverse();
                                keys.forEach(function (vKey) {
                                    let vItemData = vData[vKey];
                                    if (vItemData.posted_status === "Yes") {
                                        let v_date = moment(vItemData.voucher_date);
                                        if (grabDueDatesUnix.hasOwnProperty('start')) {
                                            if (grabDueDatesUnix.start.unix() <= v_date.unix()) {
                                                delete self.notiData[key];
                                            }
                                        }
                                        return true;
                                    }
                                });
                            }
                            process_item++;
                            if (process_item === keys.length) {
                                self.notiData = func.sortObj(self.notiData);
                                self.countNotif = Object.keys(self.notiData).length;
                                self.loadNoti = false;
                            }
                        });
                    } else {
                        process_item++;
                        if (process_item === keys.length) {
                            self.countNotif = Object.keys(self.notiData).length;
                            if (self.countNotif > 0) {
                                self.notiData = func.sortObj(self.notiData);

                            }
                            self.loadNoti = false;
                        }
                    }
                });
            } else {
                self.loadNoti = false;
            }
        });

    },
    mounted: function () {
        let self = this;
        $("body").on('click', function (event) {
            let clickedElement = $(event.target);
            let clickedDdTrigger = clickedElement.closest('.dd-trigger').length;
            let clickedDdContainer = clickedElement.closest('.dropdown-menu').length;
            if (self.opendd !== null && clickedDdTrigger === 0 && clickedDdContainer === 0) {
                self.hideNot(self.opendd);
            }
        });
    },
    data: function () {
        return {
            countNotif: 0,
            loadNoti: true,
            notiData: {},
            masterDetailsRef: null,
            vouchersRef: null,
            loadImg: true,
            s_name: "",
            pro_img_src: "/assets/images/avatar-1.jpg",
            opendd: null,
        }
    },
    methods: {
        showNotifications: function (event) {
            let targetdd = $(event.target).closest('.dropdown-container').find('.dropdown-menu');
            if (this.opendd !== null) {
                if (this.opendd[0] === targetdd[0]) {
                    this.hideNot(this.opendd);
                } else {
                    this.hideNot(this.opendd);
                    this.openNot(targetdd);
                }
            } else {
                this.openNot(targetdd);
            }
        },
        openNot: function (targetdd) {
            this.opendd = targetdd;
            targetdd.css('display', 'block').removeClass('fadeOutUp').addClass('fadeInDown')
                .on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
                    $(this).css('display', 'block');
                });
            targetdd.find('.dropdown-body')[0].scrollTop = 0;
        },
        hideNot: function (targetdd) {
            this.opendd = null;
            targetdd.removeClass('fadeInDown').addClass('fadeOutUp')
                .on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', function () {
                    $(this).css('display', 'none');
                });

            //$('#notifications-count').removeClass('fadeOut').addClass('fadeIn');
        },
        logout: function () {
            firebase.auth().signOut().then(function () {
                $("#app").removeAttr("class");
            }, function (err) {
                if (err) {
                    console.log(err);
                }
            });
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
        lockScreen: function () {
            let self = this;
            if (self.$ls.get('loginUser')) {
                let encObj = self.$ls.get('loginUser');
                let userObj = cryptoJSON.decrypt(encObj, self.$root.secKey, {keys: []});
                userObj['lock'] = true;
                let encrypted = cryptoJSON.encrypt(userObj, self.$root.secKey, {keys: []});
                self.$ls.set('loginUser', encrypted);
                self.$router.push('/lock_account');
                $("#app").removeAttr("class");
            }
        }
    }
}