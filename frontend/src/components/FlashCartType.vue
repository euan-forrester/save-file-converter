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
    <div v-if="(this.flashCartType !== null) && (this.platformTypes[this.flashCartType].length > 1)">
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
  </div>
</template>

<style scoped>
  .help-button {
    position: absolute;
    right: -1.2em;
    top: 0em;
  }

  .text-label {
    padding-left: 0.75em;
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
          this.$emit('input', this.platformType); // The second dropdown is invisible, so no events will be emitted from it because nothing will be selected
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
        { value: 'NES', text: 'NES cart' },
        { value: 'SNES', text: 'SNES cart' },
        { value: 'GB', text: 'Gameboy/Gameboy Color cart' },
        { value: 'GBA', text: 'Gameboy Advance cart' },
        { value: 'GenesisEverdrive', text: 'Genesis cart (Everdrive)' },
        { value: 'GenesisMegaSD', text: 'Genesis cart (Mega SD)' },
        { value: 'N64', text: 'Nintendo 64 cart' },
        { value: 'PCE', text: 'TurboGrafx-16/PC Engine cart' },
      ],

      platformTypes: {
        NES: [
          { value: 'FlashCart-NES', text: 'NES game' },
        ],
        SNES: [
          { value: 'FlashCart-SNES', text: 'SNES game' },
        ],
        GB: [
          { value: 'FlashCart-GB', text: 'Gameboy/Gameboy Color game' },
        ],
        GBA: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GBA', text: 'Gameboy Advance game' },
          { value: 'FlashCart-GoombaEmulator', text: 'GB/GBC game (Goomba emulator)' },
          { value: 'FlashCart-PocketNesEmulator', text: 'NES game (PocketNES emulator)' },
          { value: 'FlashCart-SMSAdvanceEmulator', text: 'SMS game (SMSAdvance emulator)' },
        ],
        GenesisEverdrive: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GenesisEverdrive', text: 'Genesis game' },
          { value: 'FlashCart-SegaCDGenesisEverdrive', text: 'Sega CD game' },
          { value: 'FlashCart-SMSGenesisEverdrive', text: 'SMS game' },
          { value: 'FlashCart-32XGenesisEverdrive', text: '32X game' },
          { value: 'FlashCart-NESGenesisEverdrive', text: 'NES game' },
        ],
        GenesisMegaSD: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-GenesisMegaSD', text: 'Genesis game' },
          { value: 'FlashCart-SegaCDMegaSD', text: 'Sega CD game' },
          { value: 'FlashCart-SMSGenesisMegaSD', text: 'SMS game' },
          { value: 'FlashCart-32XGenesisMegaSD', text: '32X game' },
        ],
        N64: [
          { value: null, text: 'Choose game type', disabled: true },
          { value: 'FlashCart-N64', text: 'Nintendo 64 game' },
          { value: 'FlashCart-NESN64', text: 'NES game' },
          { value: 'FlashCart-Neon64Emulator', text: 'NES game (Neon64 emulator)' },
          { value: 'FlashCart-GB64Emulator', text: 'GB/GBC game (GB64 emulator)' },
        ],
        PCE: [
          { value: 'FlashCart-PCE', text: 'TurboGrafx-16/PC Engine game' },
        ],
      },
    };
  },
};
</script>
