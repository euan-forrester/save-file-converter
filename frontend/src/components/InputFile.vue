<template>
  <div>
    <b-row no-gutters>
      <b-col :cols="this.widthCols">
        <file-reader @load="$emit('load', $event)" :placeholderText="this.placeholderText" :acceptExtension="this.acceptExtension"></file-reader>
      </b-col>
      <help-button v-if="this.helpText !== null" :popover-text="this.helpText" :id="this.id"/>
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
import HelpButton from './HelpButton.vue';

export default {
  name: 'InputFile',
  components: {
    FileReader,
    HelpButton,
  },
  props: {
    errorMessage: String,
    placeholderText: String,
    widthCols: {
      type: Number,
      default: 12,
    },
    helpText: {
      type: String,
      default: null,
    },
    id: String,
    acceptExtension: {
      type: String,
      default: null,
    },
  },
  data() {
    return {

    };
  },
};
</script>
