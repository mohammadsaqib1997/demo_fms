import header from '../../components/header/header.vue'
import footer from '../../components/footer/footer.vue'
import sidebar from '../../components/sidebar/sidebar.vue'

export default {
    created: function () {
        let self = this;
        $.getScript('/assets/js/dashboard.js', function (data, textStatus, jqxhr) {
            Dashboard.init();
        });
        self.show = self.$root.userLoginEmit;
        self.username = self.$root.loginUData.first_name + " " + self.$root.loginUData.last_name;
        if (self.$root.loginUData.type === "admin") {
            self.type = "Administrator";
        } else {
            self.type = "Accountant";
        }
    },
    mounted: function () {
        $(function () {
            setTimeout(function () {
                $("#page-load").fadeOut();
            }, 2000);

        });
    },
    data: function () {
        return {
            username: "",
            type: "",
            show: false,
        }
    },
    methods: {},
    components: {
        header_com: header,
        footer_com: footer,
        sidebar
    }
}