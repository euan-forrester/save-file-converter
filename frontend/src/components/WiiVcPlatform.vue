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
            popover-text="Select the platform (NES, Super NES, Sega Genesis, WiiWare, etc.) that the save is for.
            Will attempt to autodetect based on the save file, but you can choose manually as well.
            Note that Turbografx-16/PC Engine files may not be readable by some emulators."
            :id="this.id"
            class="help-button"
          />
        </div>
      </b-col>
    </b-row>
    <b-row no-gutters align-h="center" align-v="center">
      <b-col cols=12>
        <b-alert variant="danger" :show="this.errorMessage !== null">
          {{this.errorMessage}}
        </b-alert>
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
  name: 'WiiVcPlatform',
  props: {
    errorMessage: {
      type: String,
      default: null,
    },
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
        { value: 'VC-NES', text: 'NES' },
        { value: 'VC-SNES', text: 'Super NES' },
        { value: 'VC-N64', text: 'Nintendo 64' },
        { value: 'VC-PCE', text: 'Turbografx-16/PC Engine' },
        { value: 'VC-SMS', text: 'Sega Master System' },
        { value: 'VC-MD', text: 'Sega Genesis/Mega Drive' },
        { value: 'VC-NEOGEO', text: 'Neo Geo' },
        { value: 'VC-C64', text: 'Commodore 64' },
        { value: 'VC-Arcade', text: 'Arcade' },
        { value: 'WiiWare', text: 'WiiWare' },
        { value: 'Wii', text: 'Wii' },
        { value: 'Homebrew', text: 'Homebrew' },
      ],
    };
  },
};
</script>
