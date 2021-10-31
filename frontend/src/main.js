import Vue from 'vue';
import './plugins/bootstrap-vue';
import './plugins/fontawesome-vue';
import './plugins/mediaquery-vue';
import './plugins/google-tag-manager-vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
