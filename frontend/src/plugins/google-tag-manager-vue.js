import Vue from 'vue';
import VueGtm from '@gtm-support/vue2-gtm';
import router from '../router/index';

Vue.use(VueGtm, {
  id: 'GTM-MFQ82X4',
  defer: false, // Script can be set to `defer` to speed up page load at the cost of less accurate results (in case visitor leaves before script is loaded, which is unlikely but possible). Defaults to false, so the script is loaded `async` by default
  compatibility: false, // Will add `async` and `defer` to the script tag to not block requests for old browsers that do not support `async`
  enabled: process.env.VUE_APP_ENABLE_GOOGLE_TAG_MANAGER === 'true',
  debug: process.env.VUE_APP_DEBUG_GOOGLE_TAG_MANAGER === 'true', // Whether or not display console logs debugs (optional)
  loadScript: true,
  vueRouter: router,
});

console.log(`Enable GTM set to ${process.env.VUE_APP_ENABLE_GOOGLE_TAG_MANAGER} type: ${typeof process.env.VUE_APP_ENABLE_GOOGLE_TAG_MANAGER}`);
console.log(`Debug GTM set to ${process.env.VUE_APP_DEBUG_GOOGLE_TAG_MANAGER} type: ${typeof process.env.VUE_APP_DEBUG_GOOGLE_TAG_MANAGER}`);
