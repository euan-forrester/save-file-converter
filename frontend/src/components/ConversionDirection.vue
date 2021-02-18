<template>
  <div>
    <mq-layout :mq="this.horizontalLayout">
      <b-form-group v-slot="{ ariaDescribedby }">
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
      <b-form-group v-slot="{ ariaDescribedby }">
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

<script>
export default {
  props: {
    horizontalLayout: Array,
    verticalLayout: Array,
    conversionDirection: String,
  },
  data() {
    return {
      conversionDirectionInternal: this.conversionDirection, // We shouldn't directly mutate a prop because when the parent gets reloaded it'll reset its value
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
  methods: {
    onChange(event) {
      this.$emit('change', event);
    },
  },
};
</script>
