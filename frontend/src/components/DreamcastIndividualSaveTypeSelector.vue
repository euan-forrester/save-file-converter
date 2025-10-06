<template>
  <b-form-group v-slot="{ ariaDescribedby }">
    <b-form-radio-group
      v-model="valueLocal"
      :options="options"
      :aria-describedby="ariaDescribedby"
      buttons
      button-variant="outline-info"
      class="equal-width-radios w-100"
    />
  </b-form-group>
</template>

<style scoped>

/* Chatgpt generated css to make the buttons equal width */
.equal-width-radios ::v-deep .btn-group,
.equal-width-radios ::v-deep .btn-group-toggle {
  display: flex !important;
  width: 100%;
}
.equal-width-radios ::v-deep .btn {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

</style>

<script>

export default {
  name: 'DreamcastIndividualSaveTypeSelector',
  props: {
    value: {
      type: String,
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
        { value: 'dci', text: '.dci' },
        { value: 'vmivms', text: '.vmi/.vms' },
      ],
    };
  },
};
</script>
