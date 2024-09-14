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
          :popover-text="this.overrideHelpText !== null ? this.overrideHelpText :
            'Some cartridges, flash carts, or emulators may not accept saves of a particular size for a particular game. \
            Try creating a test save with your cartridge, flash cart, or emulator to find what size it expects, then adjust the value here if necessary.'"
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
  props: {
    value: {
      type: Number,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    platform: {
      type: String,
      default: null,
    },
    valuesToRemove: {
      type: Array,
      default: () => [],
    },
    overrideHelpText: {
      type: String,
      default: null,
    },
  },
  components: {
    HelpButton,
  },
  methods: {
    getDropdownText(size) {
      let kilobytesString = null;

      switch (size) {
        case 128: {
          kilobytesString = '0.1';
          break;
        }

        case 256: {
          kilobytesString = '0.25';
          break;
        }

        default: {
          kilobytesString = size < 1024 ? (size / 1024).toFixed(1) : (size / 1024).toFixed(0);
          break;
        }
      }

      return `${kilobytesString}kB (${size} bytes)`;
    },
  },
  computed: {
    options() {
      if (this.platform === null) {
        return [];
      }

      const sizes = PlatformSaveSizes[this.platform].filter((s) => this.valuesToRemove.indexOf(s) < 0);
      return [{ value: null, text: 'Output file size', disabled: true }].concat(sizes.map((s) => ({ value: s, text: this.getDropdownText(s) })));
    },
  },
};
</script>
