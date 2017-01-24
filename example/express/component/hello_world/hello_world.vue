<template>
  <div id="app" class="hello">hello {{world}}</div>
</template>
<style scoped>
  .hello {
    width: 100%;
    height: 100%;
    font-size: 48px;
    text-align: center;
    padding-top: 50px;
  }
</style>
<script>

  export default {
    name: 'HelloWorld',
    data() {
      return {
        world: ''
      };
    },
    head: {
      title: 'hello',
      script: [
        {src: "/hello_world.js", async: true}
      ],
      link: [
        { rel: 'stylesheet', href: '/style/hello_world.css' },
      ]
    },
    created() {
    },
    methods: {},
    computed: {},
    components: {}
  }
</script>