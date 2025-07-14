<template>
  <b-row no-gutters align-h="start" align-v="center">
    <b-col cols=11 sm=12>
      <div>
        <b-form-select
          v-bind:value="value"
          v-on:input="$emit('input', $event)"
          :options="options"
        />
        <help-button
          popover-text="Games from Japan and other Asian countries require a memory card created for Japan. All other games require it created for the Americas/Europe/Australia.
            It is not possible to add saves for games from both regions to the same memory card."
          :id="this.id"
          class="help-button"
        />
      </div>
    </b-col>
  </b-row>
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
  name: 'GameCubeEncodingSelector',
  props: {
    value: {
      type: String,
      default: null,
    },
    asciiText: {
      type: String,
      default: 'Americas/Europe/Australia',
    },
    shiftJisText: {
      type: String,
      default: 'Japan/Korea',
    },
    id: {
      type: String,
      default: null,
    },
  },
  components: {
    HelpButton,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  computed: {
    valueLocal: {
      get() { return this.value; },
      set(newValue) { this.$emit('change', newValue); },
    },
  },
  data() {
    return {
      options: [
        { value: 'US-ASCII', text: this.asciiText },
        { value: 'shift-jis', text: this.shiftJisText },
      ],
    };
  },
};
</script>
