<template lang="pug">
    router-view(v-if="!process")
</template>
<style>

</style>
<script>
    export default{
        computed: {
            process: function () {
                return this.$root.compileProc;
            }
        }
    }
</script>