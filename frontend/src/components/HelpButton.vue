<template>
  <b-col cols=1>
    <b-button variant="link" id="popover-target" href="#" tabindex="0">
      <font-awesome-icon :icon="['fas', 'question-circle']"/>
    </b-button>
    <b-popover target="popover-target" triggers="focus hover" placement="bottomright">
      {{this.PopoverText}}
    </b-popover>
  </b-col>
</template>

<script>
export default {
  name: 'HelpButton',
  props: [
    'PopoverText',
  ],
};
</script>
