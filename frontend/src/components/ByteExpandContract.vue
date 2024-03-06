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
            popover-text="Different emulators, cores, flash carts, and cart readers store Sega Genesis/Mega Drive files in different ways.
            Some store each 8-bit byte as a 16-bit word with 0x00 as the high byte, some use 0xFF as the high byte,
            some duplicate each byte into a 16-bit word, and some store the individual bytes as-is with no expansion."
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
    right: -2.0em;
    top: 0em;
  }
</style>

<script>
import HelpButton from './HelpButton.vue';

export default {
  name: 'ByteExpandContract',
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
        { value: null, text: 'Choose byte expansion style or contraction', disabled: true },
        { value: 'byte-expand-00', text: 'Byte expansion with 0x00 ("HELLO" -> " H E L L O")' },
        { value: 'byte-expand-ff', text: 'Byte expansion with 0xFF ("HELLO" -> " H E L L O")' },
        { value: 'byte-expand-duplicate', text: 'Byte expansion with duplication ("HELLO" -> "HHEELLLLOO")' },
        { value: 'byte-contract', text: 'Byte contraction (" H E L L O"/"HHEELLLLOO" -> "HELLO")' },
      ],
    };
  },
};
</script>
