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
import N64DexDrive from '../views/N64DexDrive.vue';
import N64Mempack from '../views/N64Mempack.vue';
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
    path: '/wii',
    name: 'Wii',
    component: Wii,
  },
  {
    path: '/gba/action-replay',
    name: 'ActionReplay',
    component: ActionReplay,
  },
  {
    path: '/gba/gameshark',
    name: 'GameShark',
    component: GameShark,
  },
  {
    path: '/gba/gameshark-sp',
    name: 'GameShark SP',
    component: GameSharkSP,
  },
  {
    path: '/gba',
    redirect: '/gba/gameshark',
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
    path: '/n64/dexdrive',
    name: 'N64 - DexDrive',
    component: N64DexDrive,
  },
  {
    path: '/n64/controller-pak',
    name: 'N64 - Controller Pak',
    component: N64Mempack,
  },
  {
    path: '/n64',
    redirect: '/n64/dexdrive',
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
  // Old paths
  {
    path: '/action-replay',
    redirect: '/gba/action-replay',
  },
  {
    path: '/gameshark',
    redirect: '/gba/gameshark',
  },
  {
    path: '/gameshark-sp',
    redirect: '/gba/gameshark-sp',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
