<template>
  <div class="test">hello {{hello}}</div>
</template>
<style scoped>
  .test {
    background-color: red;
  }
</style>
<script>
const a = {
  test() {
  }
};
export default {
  name: 'Page',
  data() {
    return {
      hello: ''
    };
  },
  async created() {
  },
  methods: {
    ...a
  },
  computed: {},
  components: {}
};
</script>