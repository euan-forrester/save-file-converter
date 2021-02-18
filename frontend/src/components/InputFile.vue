<template>
  <div>
    <b-row no-gutters align-h="center" align-v="center">
      <b-col cols=12>
        <file-reader @load="$emit('load', $event)"></file-reader>
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="center">
      <b-col cols=12>
        <b-alert variant="danger" :show="this.errorMessage !== null">
          {{this.errorMessage}}
        </b-alert>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import FileReader from './FileReader.vue';

export default {
  name: 'InputFile',
  components: {
    FileReader,
  },
  props: [
    'errorMessage',
  ],
  data() {
    return {

    };
  },
};
</script>
