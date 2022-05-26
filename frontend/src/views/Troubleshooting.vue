<template>
  <div class="home">
    <TroubleshootingUtils/>
  </div>
</template>

<script>
// @ is an alias to /src
import TroubleshootingUtils from '@/components/TroubleshootingUtils.vue';

export default {
  name: 'TroubleshootingView',
  components: {
    TroubleshootingUtils,
  },
};
</script>
