<template>
  <div class="hello">
    <textarea rows="10" v-model="text"></textarea>
    <br>
    <file-reader @load="text = $event"></file-reader>
  </div>
</template>

<script>
import FileReader from './FileReader.vue';

export default {
  name: 'ConvertRetron5',
  data: () => ({ text: '' }),
  components: {
    FileReader,
  },
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
