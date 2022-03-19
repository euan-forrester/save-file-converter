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
  name: 'MisterPlatform',
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
      // Commented out ones are platforms we support elsewhere on the site but are not possible to emulate on the MiSTer

      options: [
        { value: null, text: 'Choose platform', disabled: true },
        { value: 'Mister-NES', text: 'NES' },
        { value: 'Mister-SNES', text: 'Super NES' },
        // { value: 'Mister-N64', text: 'Nintendo 64', disabled: true },
        // { value: 'Mister-GCN', text: 'GameCube', disabled: true },
        { value: 'Mister-GB', text: 'Game Boy/Game Boy Color' },
        { value: 'Mister-GBA', text: 'Game Boy Advance' },
        { value: 'Mister-GG', text: 'Game Gear', disabled: true },
        { value: 'Mister-SMS', text: 'Sega Master System' },
        { value: 'Mister-MD', text: 'Sega Genesis/Mega Drive' },
        { value: 'Mister-SAT', text: 'Sega Saturn', disabled: true },
        // { value: 'Mister-DC', text: 'Dreamcast', disabled: true },
        { value: 'Mister-PCE', text: 'Turbografx-16/PC Engine' },
        { value: 'Mister-PS1', text: 'PlayStation 1' },
        // { value: 'Mister-PS2', text: 'PlayStation 2', disabled: true },
        { value: 'Mister-WS', text: 'WonderSwan', disabled: true },
        { value: 'Mister-AJ', text: 'Jaguar', disabled: true },
      ],
    };
  },
};
</script>
