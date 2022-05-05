<template>
  <b-collapse appear :value="display">
    <b-alert variant="info" :show="this.files.length === 0">
      No saves found in file
    </b-alert>
    <div v-show="this.files.length > 0">
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
        return [];
      },
    },
    display: {
      type: Boolean,
      default: false,
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
