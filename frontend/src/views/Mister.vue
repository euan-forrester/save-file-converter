<template>
  <div class="home">
    <ConvertMister/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertMister from '@/components/ConvertMister.vue';

export default {
  name: 'MisterView',
  components: {
    ConvertMister,
  },
};
</script>
