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
      options: [
        { value: null, text: 'Choose platform', disabled: true },
        { value: 'Mister-NES', text: 'NES', disabled: true },
        { value: 'Mister-SNES', text: 'Super NES', disabled: true },
        { value: 'Mister-N64', text: 'Nintendo 64', disabled: true },
        { value: 'Mister-GCN', text: 'GameCube', disabled: true },
        { value: 'Mister-GB', text: 'Game Boy/Game Boy Color', disabled: true },
        { value: 'Mister-GBA', text: 'Game Boy Advance', disabled: true },
        { value: 'Mister-GG', text: 'Game Gear', disabled: true },
        { value: 'Mister-SMS', text: 'Sega Master System', disabled: true },
        { value: 'Mister-MD', text: 'Sega Genesis/Mega Drive' },
        { value: 'Mister-SAT', text: 'Sega Saturn', disabled: true },
        { value: 'Mister-DC', text: 'Dreamcast', disabled: true },
        { value: 'Mister-PCE', text: 'Turbografx-16/PC Engine', disabled: true },
        { value: 'Mister-PS1', text: 'PlayStation', disabled: true },
        { value: 'Mister-PS2', text: 'PlayStation 2', disabled: true },
      ],
    };
  },
};
</script>
