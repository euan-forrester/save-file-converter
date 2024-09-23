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
            :popover-text="`Choose whether to ${this.firstWord.toLowerCase()} the header or footer`"
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
  name: 'HeaderFooter',
  props: {
    value: {
      type: String,
      default: null,
    },
    firstWord: {
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
        { value: 'header', text: `${this.firstWord} header` },
        { value: 'footer', text: `${this.firstWord} footer` },
      ],
    };
  },
};
</script>
