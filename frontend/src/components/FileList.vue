<template>
  <b-collapse appear :visible="display">
    <b-alert variant="info" :show="(this.files !== null) && (this.files.length === 0) && this.showMessageWhenEmpty">
      No saves found in file
    </b-alert>
    <div v-show="(this.files !== null) && (this.files.length > 0)">
      <b-form-group v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="valueLocal"
          :options="options"
          :aria-describedby="ariaDescribedby"
          buttons
          stacked
          button-variant="outline-info"
          class="radio-buttons"
        />
      </b-form-group>
    </div>
  </b-collapse>
</template>

<style scoped>

.radio-buttons {
  width: 100%;
}

</style>

<script>

export default {
  name: 'FileList',
  props: {
    files: {
      type: Array,
      default() {
        return null;
      },
    },
    display: {
      type: Boolean,
      default: false,
    },
    showMessageWhenEmpty: {
      type: Boolean,
      default: true,
    },
    value: {
      type: Number,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  computed: {
    options() {
      if (this.files === null) {
        return null;
      }

      const optionsEnabled = this.enabled;
      return this.files.map((f, i) => ({ value: i, text: f.displayText, disabled: !optionsEnabled }));
    },
    valueLocal: {
      get() { return this.value; },
      set(newValue) { this.$emit('change', newValue); },
    },
  },
};
</script>
