import firebase from 'firebase'

export default {
    created: function(){
        let self = this;
        self.admin = (self.$root.loginUData.type === "admin");

        jQuery(function(){
            setTimeout(function () {
                jQuery.getScript( "/assets/js/main.js", function( data, textStatus, jqxhr ) {});
                jQuery(".dashboard").click(function(e) {
                    console.log("work");
                    e.preventDefault();
                    $(this).parent().find('li ul.sub-menu').slideUp(200);
                });
            }, 100);
        });
    },
    data: function(){
        return {
            admin: false,
            sidebarData: [
                {
                    title: "Dashboard",
                    href: "/",
                    class: "dashboard",
                    icon: "<i class='ti-home'></i>"
                },
                {
                    title: "Master Files",
                    href: "#",
                    class: "master_file",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/masterFiles.png'/>",
                    children: [
                        {
                            title: "Chart of Accounts",
                            href: "#",
                            event: this.navParentClick,
                            children: [
                                {
                                    title: "Control",
                                    href: "/create_control"
                                },
                                {
                                    title: "Sub Control",
                                    href: "/create_sub_control"
                                },
                                {
                                    title: "Subsidiary",
                                    href: "/create_subsidiary"
                                },
                            ]
                        },
                        {
                            title: "Customer Detail",
                            href: "/master_details",
                        }
                    ]
                },
                {
                    title: "Master Listing",
                    href: "#",
                    class: "master_listing",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/masterListings.png'/>",
                    children: [
                        {
                            title: "List: Chart of Accounts",
                            href: "#",
                            event: this.navParentClick,
                            children: [
                                {
                                    title: "Control",
                                    href: "/listing_control"
                                },
                                {
                                    title: "Sub Control",
                                    href: "/listing_sub_control"
                                },
                                {
                                    title: "Subsidiary",
                                    href: "/listing_subsidiary"
                                },
                            ]
                        },
                    ]
                },
                {
                    title: "Transaction Files",
                    href: "#",
                    class: "transaction_file",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/transaction.png'/>",
                    children: [
                        {
                            title: "Journal Voucher",
                            href: "/journal_voucher"
                        },
                    ]
                },
                {
                    title: "Process",
                    href: "#",
                    meta: {
                        secure: "admin"
                    },
                    class: "process",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/process.png'/>",
                    children: [
                        {
                            title: "Post/Unpost",
                            href: "/post_unpost"
                        },
                    ]
                },
                {
                    title: "M.I.S Reports",
                    href: "#",
                    class: "mis_reports",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/reports.png'/>",
                    children: [
                        {
                            title: "Trial Balance",
                            href: "#",
                            event: this.navParentClick,
                            children: [
                                {
                                    title: "Control",
                                    href: "/trial_balance/list_control"
                                },
                                {
                                    title: "Sub Control",
                                    href: "/trial_balance/list_sub_control"
                                },
                                {
                                    title: "Subsidiary",
                                    href: "/trial_balance/list_subsidiary"
                                },
                            ]
                        },
                        {
                            title: "Balance Sheet",
                            href: "#",
                            event: this.navParentClick,
                            children: [
                                {
                                    title: "Control",
                                    href: "/balance_sheet/list_control"
                                },
                                {
                                    title: "Sub Control",
                                    href: "/balance_sheet/list_sub_control"
                                },
                                {
                                    title: "Subsidiary",
                                    href: "/balance_sheet/list_subsidiary"
                                },
                            ]
                        },
                        {
                            title: "Detailed Ledger",
                            href: "/detailed_ledger"
                        },
                    ]
                },
                {
                    title: "User Control",
                    href: "#",
                    meta: {
                        secure: "admin"
                    },
                    class: "user_control",
                    event: this.navParentClick,
                    icon: "<img class='icon-media' src='/assets/images/icons/user.png'/>",
                    children: [
                        {
                            title: "Create New User",
                            href: "/create_new_user"
                        },
                    ]
                },
                {
                    title: "Logout",
                    href: "#",
                    event: this.logout,
                    icon: "<img class='icon-media' src='/assets/images/icons/logout.png'/>",
                }
            ]
        }
    },
    methods: {
        logout: function () {
            firebase.auth().signOut().then(function () {
                $("#app").removeAttr("class");
            },function (err) {
                if(err){
                    console.log(err);
                }
            });
        },
        navParentClick: function (e) {
            let ancSel = $(e.target);
            if(e.target.nodeName !== "A"){
                ancSel = $(e.target).parents().closest('a');
            }
            if(ancSel.length > 0){
                let liSel = ancSel.parent();
                liSel.parent().find('li.active ul').slideUp(200, function(){
                    $(this).parent().removeClass('active open');
                });
                if(!liSel.hasClass("active open")){
                    liSel.find('> ul').slideDown(200, function(){
                        $(this).parent().addClass('active open');
                    });
                }
            }
        },
        checkActiveRoute: function (row) {
            let self = this;
            let grabClass = "";
            if(row.href === "#"){
                if(row.children && row.children.length > 0){
                    for(let cInd=0; cInd < row.children.length; cInd++){
                        let child = row.children[cInd];
                        if(child.href === "#"){
                            if(child.children && child.children.length > 0){
                                for (let scInd=0; scInd < child.children.length; scInd++){
                                    let sub_child = child.children[scInd];
                                    if(sub_child.href === self.$route.path){
                                        grabClass = "active open ";
                                        break;
                                    }
                                }
                            }
                        }else{
                            if(child.href === self.$route.path){
                                grabClass = "active open ";
                                break;
                            }
                        }
                    }
                }
            }else{

                if(row.href === self.$route.path){
                    grabClass = "active open ";
                }

            }
            if(row.class){
                grabClass += row.class;
            }
            return grabClass;
        },
        checkAdmin: function (row) {
            let self = this;
            if(row.meta){
                if(row.meta.secure){
                    if(row.meta.secure === "admin" && !self.admin){
                        return false;
                    }
                }
            }
            return true;
        }
    }
}

