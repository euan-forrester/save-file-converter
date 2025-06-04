<template>
  <div class="home">
    <ConvertGameCube/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertGameCube from '@/components/ConvertGameCube.vue';

export default {
  name: 'GameCubeView',
  components: {
    ConvertGameCube,
  },
};
</script>
