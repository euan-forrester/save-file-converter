<template>
  <b-row no-gutters align-h="start" align-v="center">
    <b-col cols=11 sm=12>
      <div>
        <b-form-select
          v-bind:value="value"
          v-on:input="$emit('input', $event)"
          :options="options"
        />
        <help-button
          popover-text="Some cartridges, flash carts, or emulators may not accept saves of a particular size for a particular game.
          Try creating a test save with your cartridge, flash cart, or emulator to find what size it expects, then adjust the value here if necessary."
          :id="this.id"
          class="help-button"
        />
      </div>
    </b-col>
  </b-row>
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
import PlatformSaveSizes from '../save-formats/PlatformSaveSizes';

export default {
  name: 'OutputFilesize',
  props: [
    'value',
    'id',
    'platform',
  ],
  components: {
    HelpButton,
  },
  methods: {
    getDropdownText(size) {
      const kilobytesString = size < 1024 ? (size / 1024).toFixed(1) : (size / 1024).toFixed(0);
      return `${kilobytesString}kB (${size} bytes)`;
    },
  },
  data() {
    return {
      options: [{ value: null, text: 'Output file size', disabled: true }].concat(PlatformSaveSizes[this.platform].map((s) => ({ value: s, text: this.getDropdownText(s) }))),
    };
  },
};
</script>
