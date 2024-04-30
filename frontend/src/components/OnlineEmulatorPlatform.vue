<template>
    <div>
    <b-row no-gutters align-h="start" align-v="center">
      <b-col cols=11 sm=12>
        <div>
          <b-form-select
            v-bind:value="value"
            v-on:input="$emit('input', $event)"
            :options="options"
            :disabled="disabled"
          />
          <help-button
            popover-text="Select the platform (GBA, Super NES, etc.) that the save is for."
            :id="this.id"
            class="help-button"
          />
        </div>
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
import HelpButton from './HelpButton.vue';

export default {
  name: 'OnlineEmulatorPlatform',
  props: {
    value: {
      type: String,
      default: null,
    },
    id: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    HelpButton,
  },
  data() {
    return {
      options: [
        { value: null, text: 'Choose platform', disabled: true },
        { value: 'gb', text: 'Game Boy/Game Boy Color' },
        { value: 'gba', text: 'Game Boy Advance' },
        { value: 'snes', text: 'Super NES' },
        { value: null, text: 'Please use the Contact/Discord page to suggest other platforms', disabled: true },
      ],
    };
  },
};
</script>
