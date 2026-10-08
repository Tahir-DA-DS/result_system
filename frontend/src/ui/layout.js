// The page frame: header, navigation (only what this role may open), sign-out.
import { h } from './dom.js';
import { session } from '../state/session.js';

export function renderShell(app, routes, current) {
  const main = h('main', { id: 'main' });
  app.replaceChildren(
    h('header', { class: 'top' },
      h('div', { class: 'brand' }, h('img', { src: '/logo.jpg', alt: '' }), h('b', {}, 'Bright Hills Academy')),
      h('div', { class: 'me' },
        h('span', { class: 'muted' }, session.user.name),
        h('a', { href: '#/account' }, 'Account'),
        h('a', { href: '#', onclick: e => { e.preventDefault(); session.clear(); dispatchEvent(new Event('session:expired')); } }, 'Sign out')),
      h('nav', {}, routes.filter(r => !r.hidden).map(r => h('a', { href: '#/' + r.path, class: r === current ? 'on' : '' }, r.title)))),
    main);
  return main;
}
