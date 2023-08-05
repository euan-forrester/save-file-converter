<template>
  <b-row no-gutters align-h="start" align-v="center">
    <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
      <div>
        <b-row>
          <b-col :sm="this.displayFileExtensionList ? 9 : 12">
            <b-form-input
              v-bind:value="value"
              v-on:input="$emit('input', $event)"
              placeholder="Output filename"
              :disabled="this.disabled"
            />
          </b-col>
          <div v-if="this.displayFileExtensionList">
            <b-col :sm="3">
              <!--
              <b-form-select

                v-model="fileExtension"
                v-on:input="$emit('input', $event)"
                :options="this.fileExtensions"
              />
              -->
              <b-form-select
                :options="this.fileExtensions"
              />
            </b-col>
          </div>
        </b-row>
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
  computed: {
    fileExtensions() {
      return [
        { value: 'sav', text: '.sav' },
        { value: 'srm', text: '.srm' },
      ];
    },
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
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
    displayFileExtensionList: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {

    };
  },
};
</script>
