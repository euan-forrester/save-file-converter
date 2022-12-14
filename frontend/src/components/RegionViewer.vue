<template>
  <b-collapse appear id="id" :visible="this.regionName !== null">
  <b-list-group>
    <b-list-group-item class="d-flex justify-content-between align-items-center align-padding">
      <div>Region:</div><div>{{ regionName }}</div>
    </b-list-group-item>
  </b-list-group>
  </b-collapse>
</template>

<style scoped>
  /* Align the word "Region" with the text in the dropdown above */
  .align-padding {
    padding-left: 0.7em;
    padding-right: 0.7em;
  }
</style>

<script>

export default {
  name: 'RegionViewer',
  props: {
    regionName: {
      type: String,
      default: null,
    },
  },
};
</script>
