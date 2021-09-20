import Vue from 'vue';
import VueRouter from 'vue-router';
import Retron5 from '../views/Retron5.vue';
import ActionReplay from '../views/ActionReplay.vue';
import GameShark from '../views/GameShark.vue';
import GameSharkSP from '../views/GameSharkSP.vue';
import Wii from '../views/Wii.vue';
import Ps1DexDrive from '../views/Ps1DexDrive.vue';
import Ps1Psp from '../views/Ps1Psp.vue';
import Ps1Emulator from '../views/Ps1Emulator.vue';
import OtherConverters from '../views/OtherConverters.vue';
import DownloadSaves from '../views/DownloadSaves.vue';
import Troubleshooting from '../views/Troubleshooting.vue';

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
    path: '/wii',
    name: 'Wii',
    component: Wii,
  },
  {
    path: '/ps1/emulator',
    name: 'PS1 - Emulator',
    component: Ps1Emulator,
  },
  {
    path: '/ps1/dexdrive',
    name: 'PS1 - DexDrive',
    component: Ps1DexDrive,
  },
  {
    path: '/ps1/psp',
    name: 'PS1 - PSP',
    component: Ps1Psp,
  },
  {
    path: '/ps1',
    redirect: '/ps1/dexdrive',
  },
  {
    path: '/troubleshooting',
    name: 'Troubleshooting',
    component: Troubleshooting,
  },
  {
    path: '/other-converters',
    name: 'OtherConverters',
    component: OtherConverters,
  },
  {
    path: '/download-saves',
    name: 'DownloadSaves',
    component: DownloadSaves,
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
