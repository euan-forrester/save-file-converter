<template>
  <div class="home">
    <EraseSave/>
  </div>
</template>

<script>
// @ is an alias to /src
import EraseSave from '@/components/EraseSave.vue';

export default {
  name: 'EraseSaveView',
  components: {
    EraseSave,
  },
};
</script>
