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
      // Commented out ones are platforms we support elsewhere on the site but are current;y available on the MiSTer

      options: [
        { value: null, text: 'Choose platform', disabled: true },
        { value: 'Mister-NES', text: 'NES' },
        { value: 'Mister-SNES', text: 'Super NES' },
        // { value: 'Mister-N64', text: 'Nintendo 64', disabled: true }, // MiSTer hardware not powerful enough
        // { value: 'Mister-GCN', text: 'GameCube', disabled: true }, // MiSTer hardware not powerful enough
        { value: 'Mister-GB', text: 'Game Boy/Game Boy Color' },
        { value: 'Mister-GBA', text: 'Game Boy Advance' },
        { value: 'Mister-GG', text: 'Game Gear' },
        { value: 'Mister-SMS', text: 'Sega Master System' },
        { value: 'Mister-MD', text: 'Sega Genesis/Mega Drive' },
        { value: 'Mister-MCD', text: 'Sega CD/Mega CD', disabled: true },
        // { value: 'Mister-32X', text: 'Sega 32X', disabled: true }, // Currently no core for this, might be created after the Saturn one
        // { value: 'Mister-SAT', text: 'Sega Saturn', disabled: true }, // Core is currently in development
        // { value: 'Mister-DC', text: 'Dreamcast', disabled: true }, // MiSTer hardware not powerful enough
        { value: 'Mister-PCE', text: 'Turbografx-16/PC Engine' },
        { value: 'Mister-PS1', text: 'PlayStation 1' },
        // { value: 'Mister-PS2', text: 'PlayStation 2', disabled: true }, // MiSTer hardware not powerful enough
        { value: 'Mister-WS', text: 'WonderSwan/WonderSwan Color', disabled: true },
        { value: 'Mister-AJ', text: 'Jaguar', disabled: true }, // Core is in early stages, saving may not be supported yet
        // { value: 'Mister-AL', text: 'Lynx', disabled: true }, // No commercial releases for Lynx with saving. A few homebrews do, but saving not implmented on the MiSTer core
      ],
    };
  },
};
</script>
