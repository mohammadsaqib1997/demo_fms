export default {
    beforeMount: function () {
        if(this.$route.path === "/sheet" || this.$route.path === "/sheet/"){
            this.$router.push('/');
        }
    },
    mounted: function () {
        $(function () {
            setTimeout(function () {
                $("#page-load").fadeOut();
            }, 2000);

        });
    },
}