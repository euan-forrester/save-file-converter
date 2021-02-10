import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faPlusCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faPlusCircle);
library.add(faCheckCircle);

Vue.component('font-awesome-icon', FontAwesomeIcon);
