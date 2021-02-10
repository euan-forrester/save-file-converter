import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faArrowCircleLeft);
library.add(faArrowCircleRight);

Vue.component('font-awesome-icon', FontAwesomeIcon);
