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
            popover-text="The word size is the number of bytes the machine's internal registers can process in a single instruction"
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
  name: 'EndiannessWordSize',
  props: {
    value: {
      type: Number,
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
        { value: null, text: 'Choose word size', disabled: true },
        { value: 2, text: '2 bytes (16 bits)' },
        { value: 4, text: '4 bytes (32 bits) (e.g. Nintendo 64)' },
        { value: 8, text: '8 bytes (64 bits) (e.g. open_agb_firm)' },
      ],
    };
  },
};
</script>
