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
    name: 'Page',
    data() {
      return {
        hello: ''
      };
    },
    created() {
    },
    methods: {},
    computed: {},
    components: {}
  };
</script>