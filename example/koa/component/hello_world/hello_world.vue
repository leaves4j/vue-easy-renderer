<template>
  <div id="app" class="hello">hello {{world}}</div>
</template>
<style scoped>
  .hello {
    width: 100%;
    height: 100%;
    font-size: 48px;
    text-align: center;
    line-height: 100%;
    padding-top: 50px;
  }
</style>
<script>

  export default {
    name: 'HelloWorld',
    head: {
      title: 'hello',
      script: [
        {src: '/hello_world.js', async: true}
      ],
      link: [
        {rel: 'stylesheet', href: '/style/hello_world.css'},
      ]
    },
    data() {
      return {
        world: ''
      };
    },
    created() {
    },
    methods: {},
    computed: {},
    components: {}
  };
</script>