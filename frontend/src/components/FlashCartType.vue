<template>
    <div>
    <b-row no-gutters align-h="start" align-v="center">
      <b-col cols=11 sm=12>
        <div>
          <b-form-select
            v-model="flashCartType"
            v-on:input="changeFlashCartType()"
            :options="flashCartTypes"
            :disabled="disabled"
          />
          <help-button
            popover-text="Select the type of flash cart that you're using."
            :id="`${this.id}-flash-cart-type`"
            class="help-button"
          />
        </div>
      </b-col>
    </b-row>
    <b-row no-gutters align-h="start" align-v="center">
      <b-col cols=11 sm=12>
        <div>
          <b-form-select
            v-model="platformType"
            v-on:input="$emit('input', $event)"
            :options="this.platformTypes[this.flashCartType]"
            :disabled="disabled"
          />
          <help-button
            popover-text="Select the type of game that the save is for."
            :id="`${this.id}-platform-type`"
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
  methods: {
    changeFlashCartType() {
      if (this.flashCartType !== null) {
        if (this.platformTypes[this.flashCartType].length === 1) {
          this.platformType = this.platformTypes[this.flashCartType][0].value;
        } else {
          this.platformType = null; // If > 1 item in the list, then display the "Choose game type" option
        }
      } else {
        this.platformType = null;
      }
    },
  },
  data() {
    return {
      flashCartType: null,
      platformType: null,
      flashCartTypes: [
        { value: null, text: 'Choose flash cart type', disabled: true },
        { value: 'NES', text: 'NES' },
        { value: 'SNES', text: 'SNES' },
        { value: 'GB', text: 'Gameboy/Gameboy Color' },
        { value: 'GBA', text: 'Gameboy Advance' },
        { value: 'GenesisEverdrive', text: 'Genesis (Everdrive)' },
        { value: 'GenesisMegaSD', text: 'Genesis (Mega SD)' },
        { value: 'N64', text: 'Nintendo 64' },
      ],

      platformTypes: {
        NES: [
          { value: 'FlashCart-NES', text: 'NES' },
        ],
        SNES: [
          { value: 'FlashCart-SNES', text: 'SNES' },
        ],
        GB: [
          { value: 'FlashCart-GB', text: 'Gameboy/Gameboy Color' },
        ],
        GBA: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GBA', text: 'Gameboy Advance' },
          { value: 'FlashCart-GoombaEmulator', text: 'GB/GBC (Goomba emulator)' },
          { value: 'FlashCart-PocketNesEmulator', text: 'NES (PocketNES emulator)' },
          { value: 'FlashCart-SMSAdvanceEmulator', text: 'SMS (SMSAdvance emulator)' },
        ],
        GenesisEverdrive: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GenesisEverdrive', text: 'Genesis' },
          { value: 'FlashCart-NESGenesisEverdrive', text: 'NES' },
          { value: 'FlashCart-SMSGenesisEverdrive', text: 'SMS' },
        ],
        GenesisMegaSD: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GenesisMegaSD', text: 'Genesis' },
          { value: 'FlashCart-SMSGenesisMegaSD', text: 'SMS' },
        ],
        N64: [
          { value: 'FlashCart-N64', text: 'Nintendo 64' },
        ],
      },
    };
  },
};
</script>
