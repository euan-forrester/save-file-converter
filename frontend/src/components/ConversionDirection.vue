<template>
  <div>
    <mq-layout :mq="this.horizontalLayout">
      <b-form-group v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="conversionDirectionInternal"
          :options="optionsHorizontal"
          :aria-describedby="ariaDescribedby"
          button-variant="outline-info"
          stacked
          buttons
        />
      </b-form-group>
    </mq-layout>
    <mq-layout :mq="this.verticalLayout">
      <b-form-group v-slot="{ ariaDescribedby }">
        <b-form-radio-group
          v-model="conversionDirectionInternal"
          :options="optionsVertical"
          :aria-describedby="ariaDescribedby"
          button-variant="outline-info"
          buttons
        />
      </b-form-group>
    </mq-layout>
  </div>
</template>

<script>
export default {
  props: {
    horizontalLayout: Array,
    verticalLayout: Array,
    conversionDirection: String,
  },
  data() {
    return {
      conversionDirectionInternal: this.conversionDirection,
      optionsHorizontal: [
        { html: '<i class="fa fa-arrow-circle-right fa-3x"></i>', value: 'convertToEmulator' },
        { html: '<i class="fa fa-arrow-circle-left fa-3x"></i>', value: 'convertToRetron5' },
      ],
      optionsVertical: [
        { html: '<i class="fa fa-arrow-circle-down fa-3x"></i>', value: 'convertToEmulator' },
        { html: '<i class="fa fa-arrow-circle-up fa-3x"></i>', value: 'convertToRetron5' },
      ],
    };
  },
};
</script>
