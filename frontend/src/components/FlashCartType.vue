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
            popover-text="Select the platform (Game Boy, Nintendo 64, etc.) that the save is for."
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
  name: 'FlashCartType',
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
      // Commented out ones are platforms we support elsewhere on the site but are currently available on the MiSTer

      options: [
        { value: null, text: 'Choose platform', disabled: true },
        { value: 'FlashCart-GoombaEmulator', text: 'GB/GBC on GBA (Goomba emulator)' },
        { value: 'FlashCart-PocketNesEmulator', text: 'NES on GBA (PocketNES emulator)' },
        { value: 'FlashCart-N64', text: 'Nintendo 64' },
      ],
    };
  },
};
</script>
