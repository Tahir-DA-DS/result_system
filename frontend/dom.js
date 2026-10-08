// Tiny helpers for building the page. Text is never parsed as HTML, so user input cannot inject markup.
export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(props || {})) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.className = v;
    else if (k === 'value') value = v;                    // set after children, so <select> works
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) if (kid !== false && kid != null) el.append(kid.nodeType ? kid : document.createTextNode(kid));
  if (value !== undefined) el.value = value;
  return el;
}
export const card = (...kids) => h('div', { class: 'card' }, ...kids);
export const field = (label, input) => h('label', { class: 'field' }, h('span', { class: 'muted' }, label), input);
// <option> list from [[value, text], ...]; `blank` adds an empty first option.
export const options = (items, blank) => [blank != null && h('option', { value: '' }, blank), ...items.map(([v, t]) => h('option', { value: v }, t))];

// Replace everything inside `parent`. Unlike parent.replaceChildren(), this accepts arrays and skips false/null,
// so `cond && card(...)` and `list.map(...)` work. (Passing an array straight to the DOM turns it into text.)
export function mount(parent, ...kids) {
  parent.replaceChildren(...kids.flat(Infinity).filter(k => k !== false && k != null).map(k => (k.nodeType ? k : document.createTextNode(k))));
}
