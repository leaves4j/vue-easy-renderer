<template>
  <div class="test">hello {{world}}</div>
</template>
<style scoped lang='scss'>
  .test {
    background-color: red;
  }
</style>
<script>
  import Vue from 'vue';
  import Vuex from 'vuex';

  Vue.use(Vuex);

  const store = new Vuex.Store({
    state: {
      world: '',
    },
  });

  export default {
    name: 'Page',
    store,
    data() {
      return {};
    },
    async created() {
    },
    methods: {},
    computed: {
      world() {
        return this.$store.state.world;
      },
    },
    components: {},
  };
</script>