<template>
  <div>
    <mq-layout :mq="this.horizontalLayout">
      <b-form-group class="horizontal-arrangement" v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="conversionDirectionInternal"
          :options="optionsHorizontal"
          :aria-describedby="ariaDescribedby"
          button-variant="outline-info"
          @change="onChange($event)"
          stacked
          buttons
        />
      </b-form-group>
    </mq-layout>
    <mq-layout :mq="this.verticalLayout">
      <b-form-group class="vertical-arrangement" v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="conversionDirectionInternal"
          :options="optionsVertical"
          :aria-describedby="ariaDescribedby"
          button-variant="outline-info"
          @change="onChange($event)"
          buttons
        />
      </b-form-group>
    </mq-layout>
  </div>
</template>

<style scoped>

.horizontal-arrangement {
  margin-top: 2.5em;
  margin-left: 0.5em;
  margin-right: 0.5em;
}

.vertical-arrangement {
  margin-top: 1em;
}

</style>

<script>
export default {
  props: {
    horizontalLayout: Array,
    verticalLayout: Array,
    conversionDirection: String,
    disableDirection: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      conversionDirectionInternal: this.conversionDirection, // We shouldn't directly mutate a prop because when the parent gets reloaded it'll reset its value
      optionsHorizontal: [
        { html: '<i class="fa fa-arrow-circle-right fa-3x"></i>', value: 'convertToRaw', disabled: this.disableDirection === 'convertToRaw' },
        { html: '<i class="fa fa-arrow-circle-left fa-3x"></i>', value: 'convertToFormat', disabled: this.disableDirection === 'convertToFormat' },
      ],
      optionsVertical: [
        { html: '<i class="fa fa-arrow-circle-down fa-3x"></i>', value: 'convertToRaw', disabled: this.disableDirection === 'convertToRaw' },
        { html: '<i class="fa fa-arrow-circle-up fa-3x"></i>', value: 'convertToFormat', disabled: this.disableDirection === 'convertToFormat' },
      ],
    };
  },
  methods: {
    onChange(event) {
      this.$emit('change', event);
    },
  },
};
</script>
