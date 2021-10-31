<template>
  <b-col cols=1>
    <!-- Note that we choose a button because we need to render out an <a> element in order for the focus trigger to work for mobile:
    https://bootstrap-vue.org/docs/components/popover#caveats-with-focus-trigger-on-button-elements -->
    <b-button variant="link" :id="`${this.id}-popover-target`" href="#" tabindex="0">
      <font-awesome-icon :icon="['fas', 'question-circle']"/>
    </b-button>
    <b-popover :target="`${this.id}-popover-target`" triggers="focus hover" placement="bottom">
      {{this.popoverText}}
    </b-popover>
  </b-col>
</template>

<script>
import { BPopover } from 'bootstrap-vue';

export default {
  name: 'HelpButton',
  props: [
    'popoverText',
    'id',
  ],
  components: {
    BPopover,
  },
};
</script>
