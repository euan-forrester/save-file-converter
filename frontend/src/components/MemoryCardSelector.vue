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
  name: 'FileList',
  props: {
    files: {
      type: Array,
      default() {
        return [];
      },
    },
    value: {
      type: Number,
      default: null,
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
        { value: 0, text: 'Memory card 1' },
        { value: 1, text: 'Memory card 2' },
      ],
    };
  },
};
</script>
