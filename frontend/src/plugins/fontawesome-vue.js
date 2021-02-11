import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowCircleLeft,
  faArrowCircleRight,
  faArrowCircleUp,
  faArrowCircleDown,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faArrowCircleLeft);
library.add(faArrowCircleRight);
library.add(faArrowCircleUp);
library.add(faArrowCircleDown);

Vue.component('font-awesome-icon', FontAwesomeIcon);
