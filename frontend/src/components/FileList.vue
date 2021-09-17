<template>
  <b-collapse appear v-model="display">
    <b-form-group v-slot="{ ariaDescribedby }">
      <b-form-radio-group
        v-bind:value="value"
        v-on:change="$emit('change', $event)"
        :options="options"
        :aria-describedby="ariaDescribedby"
        buttons
        stacked
        button-variant="outline-info"
        class="radio-buttons"
      />
    </b-form-group>
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
  },
  computed: {
    options() {
      return this.files.map((f, i) => ({ value: i, text: f.description }));
    },
  },
};
</script>
