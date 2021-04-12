import Vue from 'vue';
import VueRouter from 'vue-router';
import Retron5 from '../views/Retron5.vue';
import GameShark from '../views/GameShark.vue';
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
    path: '/gameshark',
    name: 'GameShark',
    component: GameShark,
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
