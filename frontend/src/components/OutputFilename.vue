<template>
  <b-row no-gutters align-h="start" align-v="center">
    <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
      <div>
        <b-form-input
          v-bind:value="value"
          v-on:input="$emit('input', $event)"
          placeholder="Output filename"
        />
        <div v-if="this.helpText !== null">
          <help-button
            :popover-text="this.helpText"
            :id="this.id"
            class="help-button"
          />
        </div>
      </div>
    </b-col>
  </b-row>
</template>

<style scoped>

::placeholder {
  color: #495057; /* bootstrap's $gray-700. Otherwise it doesn't match the placeholder color for b-form-file (and b-form-select) */
}

.help-button {
  position: absolute;
  right: -1.2em;
  top: 0em;
}

</style>

<script>
import HelpButton from './HelpButton.vue';

export default {
  name: 'OutputFilename',
  components: {
    HelpButton,
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: null,
    },
    leaveRoomForHelpIcon: {
      type: Boolean,
      default: false,
    },
    helpText: {
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
