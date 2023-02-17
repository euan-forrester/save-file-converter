<template>
  <div class="home">
    <ConvertSegaCd/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertSegaCd from '@/components/ConvertSegaCd.vue';

export default {
  name: 'SegaCdView',
  components: {
    ConvertSegaCd,
  },
};
</script>
