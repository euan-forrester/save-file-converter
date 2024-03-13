<template>
  <div>
    <b-row no-gutters>
      <b-col :cols="this.leaveRoomForHelpIcon ? 11 : 12" sm="12">
        <div>
          <b-form-input
            v-on:input="checkInput($event)"
            :placeholder="this.placeholderText"
            :state="this.isValid"
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
  right: -1.6em;
  top: 0em;
}

</style>

<script>
import HelpButton from './HelpButton.vue';

const DECIMAL_REGEX = /^[0-9]+$/;
const HEXADECIMAL_REGEX = /^[0-9a-f]+$/;

export default {
  name: 'InputFile',
  components: {
    HelpButton,
  },
  props: {
    errorMessage: {
      type: String,
      default: null,
    },
    placeholderText: String,
    helpText: {
      type: String,
      default: null,
    },
    id: String,
    leaveRoomForHelpIcon: Boolean,
  },
  methods: {
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
  data() {
    return {
      isValid: null,
    };
  },
};
</script>
