<template>
  <div>
    <b-row no-gutters>
      <b-col v-if="this.labelText !== null" cols="5" sm="4" align-self="center">
        <!-- Is this a bug? Not sure why this lint rule fires here: the <label> tag has a "for" set, and it matches the <b-form-input>'s "id" below -->
        <!-- eslint-disable-next-line vuejs-accessibility/label-has-for -->
        <label :for="this.id" class="label">{{ labelText }}</label>
      </b-col>
      <b-col :cols="(this.labelText !== null) ? 6 : 11" :sm="(this.labelText !== null) ? 8 : 12">
        <div>
          <b-form-input
            v-on:input="checkInput($event)"
            :placeholder="this.placeholderText"
            :state="this.isValid"
            :id="this.id"
            v-model="value"
          />
          <help-button
            v-if="this.helpText !== null"
            :popover-text="this.helpText"
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

::placeholder {
  color: #495057; /* bootstrap's $gray-700. Otherwise it doesn't match the placeholder color for b-form-file (and b-form-select) */
}

.help-button {
  position: absolute;
  right: -1.2em;
  top: 0em;
}

.label {
  position: absolute;
  top: -0.77em;
  left: 0.8em;
}

</style>

<script>
import HelpButton from './HelpButton.vue';

const DECIMAL_REGEX = /^[0-9]+$/;
const HEXADECIMAL_REGEX = /^[0-9a-f]+$/;

export default {
  name: 'InputNumber',
  components: {
    HelpButton,
  },
  props: {
    errorMessage: {
      type: String,
      default: null,
    },
    labelText: {
      type: String,
      default: null,
    },
    placeholderText: {
      type: String,
      default: null,
    },
    helpText: {
      type: String,
      default: null,
    },
    id: String,
    leaveRoomForHelpIcon: Boolean,
  },
  data() {
    return {
      isValid: null,
      value: null,
    };
  },
  methods: {
    reset() {
      this.value = null;
      this.isValid = null;
    },
    checkInput(event) {
      let userInput = event.trim();

      if (userInput.startsWith('0x')) {
        userInput = userInput.substring(2);

        if (userInput.match(HEXADECIMAL_REGEX)) {
          this.isValid = null;
          this.$emit('input', parseInt(userInput, 16));
        } else {
          this.isValid = false;
          this.$emit('input', null);
        }
      } else if (userInput.match(DECIMAL_REGEX)) {
        this.isValid = null;
        this.$emit('input', parseInt(userInput, 10));
      } else {
        this.isValid = false;
        this.$emit('input', null);
      }
    },
  },
};
</script>
