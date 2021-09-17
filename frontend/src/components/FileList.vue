<template>
  <b-collapse appear v-model="display">
    <b-alert variant="info" :show="this.files.length === 0">
      No saves found in file
    </b-alert>
    <div v-show="this.files.length > 0">
      <b-form-group v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="myValueLocal"
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
    myValue: {
      type: Number,
      default: null,
    },
  },
  model: {
    prop: 'myValue',
    event: 'myChange',
  },
  computed: {
    options() {
      return this.files.map((f, i) => ({ value: i, text: f.description }));
    },
    myValueLocal: {
      get() { return this.myValue; },
      set(newValue) { this.$emit('myChange', newValue); },
    },
  },
};
</script>
