<template>
  <div>
    <b-row no-gutters>
      <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
        <div>
          <file-reader
            @load="$emit('load', $event)"
            :placeholderText="this.placeholderText"
            :acceptExtension="this.acceptExtension"
            :allowMultipleFiles="this.allowMultipleFiles"
          />
          <help-button
            v-if="this.helpText !== null"
            :popover-text="this.helpText"
            :id="this.id"
            class="help-button"
          />
        </div>
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

<style scoped>

.help-button {
  position: absolute;
  right: -1.2em;
  top: 0em;
}

</style>

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
    errorMessage: {
      type: String,
      default: null,
    },
    placeholderText: String,
    helpText: {
      type: String,
      default: null,
    },
    id: String,
    acceptExtension: {
      type: String,
      default: null,
    },
    leaveRoomForHelpIcon: Boolean,
    allowMultipleFiles: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {

    };
  },
};
</script>
