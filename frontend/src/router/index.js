import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/mister',
  },
  {
    path: '/retron-5',
    name: 'Retron5',
    component: () => import(/* webpackChunkName: "retron5" */ '../views/Retron5.vue'),
  },
  {
    path: '/retron-5/erase-save',
    name: 'Erase save - Retron5',
    component: () => import(/* webpackChunkName: "erase-save-retron5" */ '../views/Retron5EraseSaveView.vue'),
  },
  {
    path: '/wii',
    name: 'Wii',
    component: () => import(/* webpackChunkName: "wii" */ '../views/Wii.vue'),
  },
  {
    path: '/gba/action-replay',
    name: 'GBA - ActionReplay',
    component: () => import(/* webpackChunkName: "gba-action-replay" */ '../views/GbaActionReplay.vue'),
  },
  {
    path: '/gba/gameshark',
    name: 'GBA - GameShark',
    component: () => import(/* webpackChunkName: "gba-gameshark" */ '../views/GbaGameShark.vue'),
  },
  {
    path: '/gba/gameshark-sp',
    name: 'GBA - GameShark SP',
    component: () => import(/* webpackChunkName: "gba-gameshark-sp" */ '../views/GbaGameSharkSP.vue'),
  },
  {
    path: '/gba',
    redirect: '/gba/gameshark',
  },
  {
    path: '/ps1/emulator',
    name: 'PS1 - Emulator',
    component: () => import(/* webpackChunkName: "ps1-emulator" */ '../views/Ps1Emulator.vue'),
  },
  {
    path: '/ps1/dexdrive',
    name: 'PS1 - DexDrive',
    component: () => import(/* webpackChunkName: "ps1-dexdrive" */ '../views/Ps1DexDrive.vue'),
  },
  {
    path: '/ps1/psp',
    name: 'PS1 - PSP',
    component: () => import(/* webpackChunkName: "ps1-psp" */ '../views/Ps1Psp.vue'),
  },
  {
    path: '/ps1/ps3',
    name: 'PS1 - PS3',
    component: () => import(/* webpackChunkName: "ps1-ps3" */ '../views/Ps1Ps3.vue'),
  },
  {
    path: '/ps1',
    redirect: '/ps1/dexdrive',
  },
  {
    path: '/psp',
    name: 'PSP decrypt',
    component: () => import(/* webpackChunkName: "psp-decrypt" */ '../views/PspDecrypt.vue'),
  },
  {
    path: '/n64/dexdrive',
    name: 'N64 - DexDrive',
    component: () => import(/* webpackChunkName: "n64-dexdrive" */ '../views/N64DexDrive.vue'),
  },
  {
    path: '/n64/controller-pak',
    name: 'N64 - Controller Pak',
    component: () => import(/* webpackChunkName: "n64-mempack" */ '../views/N64Mempack.vue'),
  },
  {
    path: '/n64',
    redirect: '/n64/dexdrive',
  },
  {
    path: '/mister',
    name: 'MiSTer',
    component: () => import(/* webpackChunkName: "mister" */ '../views/Mister.vue'),
  },
  {
    path: '/flash-carts',
    name: 'Flash carts',
    component: () => import(/* webpackChunkName: "flash-carts" */ '../views/FlashCarts.vue'),
  },
  {
    path: '/online-emulators',
    name: 'Online emulators',
    component: () => import(/* webpackChunkName: "online-emulators" */ '../views/OnlineEmulators.vue'),
  },
  {
    path: '/sega-cd',
    name: 'Sega CD',
    component: () => import(/* webpackChunkName: "sega-cd" */ '../views/SegaCd.vue'),
  },
  {
    path: '/nintendo-switch-online',
    name: 'Nintendo Switch Online',
    component: () => import(/* webpackChunkName: "nintendo-switch-online" */ '../views/NintendoSwitchOnline.vue'),
  },
  {
    path: '/srm-sav',
    name: '.srm to/from .sav',
    component: () => import(/* webpackChunkName: "srm-sav" */ '../views/SrmSav.vue'),
  },
  {
    path: '/utilities',
    redirect: '/utilities/advanced',
  },
  {
    path: '/utilities/troubleshooting',
    name: 'Troubleshooting',
    component: () => import(/* webpackChunkName: "troubleshooting" */ '../views/Troubleshooting.vue'),
  },
  {
    path: '/utilities/erase-save',
    name: 'Erase save',
    component: () => import(/* webpackChunkName: "erase-save" */ '../views/EraseSaveView.vue'),
  },
  {
    path: '/utilities/advanced',
    name: 'Advanced',
    component: () => import(/* webpackChunkName: "advanced" */ '../views/AdvancedView.vue'),
    props: (route) => ({ initialTab: route.query.tab }),
  },
  {
    path: '/other-converters',
    name: 'OtherConverters',
    component: () => import(/* webpackChunkName: "other-converters" */ '../views/OtherConverters.vue'),
  },
  {
    path: '/download-saves',
    name: 'DownloadSaves',
    component: () => import(/* webpackChunkName: "download-saves" */ '../views/DownloadSaves.vue'),
  },
  {
    path: '/original-hardware',
    name: 'OriginalHardware',
    component: () => import(/* webpackChunkName: "original-hardware" */ '../views/OriginalHardware.vue'),
    props: (route) => ({ initialSortBy: route.query.sort }),
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
  {
    path: '/troubleshooting',
    redirect: '/utilities/troubleshooting',
  },
];

const router = new VueRouter({
  routes,
});

export default router;
