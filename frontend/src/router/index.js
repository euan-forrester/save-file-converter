import Vue from 'vue';
import VueRouter from 'vue-router';
import Retron5 from '../views/Retron5.vue';
import ActionReplay from '../views/ActionReplay.vue';
import GameShark from '../views/GameShark.vue';
import GameSharkSP from '../views/GameSharkSP.vue';
import OtherConverters from '../views/OtherConverters.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/retron-5',
  },
  {
    path: '/retron-5',
    name: 'Retron5',
    component: Retron5,
  },
  {
    path: '/action-replay',
    name: 'ActionReplay',
    component: ActionReplay,
  },
  {
    path: '/gameshark',
    name: 'GameShark',
    component: GameShark,
  },
  {
    path: '/gameshark-sp',
    name: 'GameShark SP',
    component: GameSharkSP,
  },
  {
    path: '/other-converters',
    name: 'OtherConverters',
    component: OtherConverters,
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
