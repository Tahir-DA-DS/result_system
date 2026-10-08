import { h } from './dom.js';
export const statusTag = status => h('span', { class: 'tag st-' + status }, status);
