<template>
  <div class="home">
    <ConvertOnlineEmulators/>
  </div>
</template>

<script>
// @ is an alias to /src
import ConvertOnlineEmulators from '@/components/ConvertOnlineEmulators.vue';

export default {
  name: 'OnlineEmulatorsView',
  components: {
    ConvertOnlineEmulators,
  },
};
</script>
