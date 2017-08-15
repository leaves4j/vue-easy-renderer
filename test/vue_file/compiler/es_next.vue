<template>
  <div class="test">hello {{hello}}</div>
</template>
<style scoped>
</style>
<script>
const spread = {
  test() {
  },
};
export default {
  name: 'ESNext',
  data() {
    return {
      hello: '',
    };
  },
  async created() {
    this.test();
  },
  methods: {
    ...spread,
  },
  computed: {},
  components: {},
};
</script>