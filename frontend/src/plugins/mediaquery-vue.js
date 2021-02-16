import Vue from 'vue';
import VueMq from 'vue-mq';

Vue.use(VueMq, {
  breakpoints: { // Values copied from https://bootstrap-vue.js.org/docs/components/layout/ to be consistent with bootstrap's layout plugin
    xs: 576,
    sm: 768,
    md: 992,
    lg: 1200,
    xl: Infinity,
  },
});
