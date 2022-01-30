import Vue from 'vue';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowCircleLeft,
  faArrowCircleRight,
  faArrowCircleUp,
  faArrowCircleDown,
  faQuestionCircle,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faArrowCircleLeft);
library.add(faArrowCircleRight);
library.add(faArrowCircleUp);
library.add(faArrowCircleDown);
library.add(faQuestionCircle);
library.add(faCheck);
library.add(faTimes);

Vue.component('font-awesome-icon', FontAwesomeIcon);

// This will kick off the initial replacement of i to svg tags and configure a MutationObserver
dom.watch();
