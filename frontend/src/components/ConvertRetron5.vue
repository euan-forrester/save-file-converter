<template>
  <div class="hello">
    <textarea rows="40" cols="100" v-model="text"></textarea>
    <br>
    <file-reader @load="readRetron5SaveData($event)"></file-reader>
  </div>
</template>

<script>
import FileReader from './FileReader.vue';
import Retron5SaveData from '../save-formats/Retron5';

export default {
  name: 'ConvertRetron5',
  data() {
    return {
      text: '',
    };
  },
  components: {
    FileReader,
  },
  methods: {
    readRetron5SaveData(blob) {
      const retron5SaveData = new Retron5SaveData(blob);
      this.text = `Magic: 0x${retron5SaveData.getMagic().toString(16)} `
        + `Format version: ${retron5SaveData.getFormatVersion()} `
        + `Flags: 0x${retron5SaveData.getFlags().toString(16)} `
        + `Original Size: ${retron5SaveData.getOriginalSize()} `
        + `Packed size: ${retron5SaveData.getPackedSize()} `
        + `Data offset: ${retron5SaveData.getDataOffset()} `
        + `CRC32: 0x${retron5SaveData.getCrc32().toString(16)} `
        + `Save data: ${retron5SaveData.getRawSaveData()}`;
    },
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
