<template>
  <div class="home">
    <ConvertSrmSav/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertSrmSav from '@/components/ConvertSrmSav.vue';

export default {
  name: 'SrmSavView',
  components: {
    ConvertSrmSav,
  },
};
</script>
