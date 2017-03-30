
<template>
  <div class="test">hello {{hello}}</div>
</template>
<style scoped>
  .test {
    background-color: red;
  }
</style>
<script>
  export default {
    name: 'HeadPage',
    data() {
      return {
        hello: ''
      };
    },
    head: {
      script: [{src: `/app.js?_v=${APP_VERSION}`, defer: true}]
    },
    created() {
    },
    methods: {},
    computed: {},
    components: {}
  };
</script>