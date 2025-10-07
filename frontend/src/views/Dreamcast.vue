<template>
  <div class="home">
    <ConvertDreamcast/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertDreamcast from '@/components/ConvertDreamcast.vue';

export default {
  name: 'DreamcastView',
  components: {
    ConvertDreamcast,
  },
};
</script>
