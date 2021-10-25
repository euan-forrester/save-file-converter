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
  name: 'IndividualSavesOrMemoryCardSelector',
  props: {
    value: {
      type: String,
      default: null,
    },
    individualSavesText: {
      type: String,
      default: 'Individual saves',
    },
    memoryCardText: {
      type: String,
      default: 'Memory card',
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
  data() {
    return {
      options: [
        { value: 'individual-saves', text: this.individualSavesText },
        { value: 'memory-card', text: this.memoryCardText },
      ],
    };
  },
};
</script>
