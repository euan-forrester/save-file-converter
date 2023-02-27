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
            popover-text="Select the platform (NES, Super NES, Sega Genesis, etc.) that the save is for."
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
  name: 'NintendoSwitchOnlinePlatform',
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
        { value: 'NSO-NES', text: 'NES' },
        { value: 'NSO-SNES', text: 'Super NES' },
        { value: 'NSO-GB', text: 'Game Boy/Game Boy Color' },
        { value: 'NSO-GBA', text: 'Game Boy Advance' },
        { value: 'NSO-MD', text: 'Sega Genesis/Mega Drive' },
        { value: 'NSO-N64', text: 'Nintendo 64' },
      ],
    };
  },
};
</script>
