import { h, field } from '../ui/dom.js';
import { run } from '../ui/feedback.js';
import { Auth } from '../api/endpoints.js';
import { session } from '../state/session.js';

export function renderLogin(app, done) {
  const email = h('input', { type: 'email', autocomplete: 'username', required: true });
  const password = h('input', { type: 'password', autocomplete: 'current-password', required: true });
  const submit = h('button', { class: 'btn', type: 'submit' }, 'Sign in');
  const form = h('form', { class: 'card login', onsubmit: e => {
    e.preventDefault();
    run(submit, async () => {
      const { token, user } = await Auth.login(email.value, password.value);
      session.set(token, user);
      location.hash = '#/';
      done();
    });
  } }, h('img', { src: '/logo.jpg', alt: 'Bright Hills Academy' }), h('h2', {}, 'Results System'),
  field('Email', email), field('Password', password), submit);
  app.replaceChildren(form);
}
