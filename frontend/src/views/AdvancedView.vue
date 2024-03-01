<template>
  <div class="home">
    <AdvancedUtils
      :initialTab="this.initialTab"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import AdvancedUtils from '@/components/AdvancedUtils.vue';

export default {
  name: 'AdvancedView',
  components: {
    AdvancedUtils,
  },
  props: {
    initialTab: {
      type: String,
      default: 'endian-swap',
    },
  },
};
</script>
