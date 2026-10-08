// Hash routing (#/staff). Picks the screen, checks the role, and shows login when signed out.
import { session } from './state/session.js';
import { routes } from './routes.js';
import { renderShell } from './ui/layout.js';
import { renderLogin } from './views/login.js';
import { h } from './ui/dom.js';

const app = document.getElementById('app');

export async function navigate() {
  if (!session.token) return renderLogin(app, navigate);

  const allowed = routes.filter(r => r.roles.includes(session.user.role));
  const wanted = location.hash.replace(/^#\//, '');
  const route = allowed.find(r => r.path === wanted);
  if (!route) { location.hash = '#/' + allowed.find(r => !r.hidden).path; return; }

  const main = renderShell(app, allowed, route);
  main.append(h('p', { class: 'muted' }, 'Loading…'));
  try {
    const view = await route.load();
    main.replaceChildren();
    await view.render(main);
  } catch (e) {
    main.replaceChildren(h('div', { class: 'card error' }, e.message));
  }
}

export function startRouter() {
  addEventListener('hashchange', navigate);
  addEventListener('session:expired', () => { location.hash = '#/'; navigate(); });
  navigate();
}
