// The signed-in user and token, kept in this browser only.
const KEY = 'bh_session';
let data = null;
try { data = JSON.parse(localStorage.getItem(KEY)); } catch { data = null; }

export const session = {
  get token() { return data?.token; },
  get user() { return data?.user; },
  set(token, user) { data = { token, user }; localStorage.setItem(KEY, JSON.stringify(data)); },
  clear() { data = null; localStorage.removeItem(KEY); },
};
