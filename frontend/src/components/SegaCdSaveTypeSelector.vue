<template>
  <b-form-group v-slot="{ ariaDescribedby }">
    <b-form-radio-group
      v-model="valueLocal"
      :options="options"
      :aria-describedby="ariaDescribedby"
      buttons
        button-variant="outline-info"
      class="radio-buttons"
    />
  </b-form-group>
</template>

<style scoped>

.radio-buttons {
  width: 100%;
}

</style>

<script>

export default {
  name: 'SegaCdSaveTypeSelector',
  props: {
    value: {
      type: String,
      default: null,
    },
    internalMemoryText: {
      type: String,
      default: 'Internal memory',
    },
    ramCartText: {
      type: String,
      default: 'RAM cartridge',
    },
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
  watch: {
    ramCartText: {
      immediate: true,
      handler(newValue) {
        this.options = [
          { value: 'internal-memory', text: this.internalMemoryText },
          { value: 'ram-cart', text: newValue },
        ];
      },
    },
  },
  data() {
    return {
      options: null,
    };
  },
};
</script>
