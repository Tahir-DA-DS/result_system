// Term, session, dates and "times school open". Entered once; used on every result sheet.
import { h, card, field } from '../../ui/dom.js';
import { run, toast } from '../../ui/feedback.js';
import { Term } from '../../api/endpoints.js';

const FIELDS = [['term', 'Term (First, Second or Third)'], ['session', 'Session, e.g. 2025/2026'], ['open', 'Times school open'],
  ['resumed', 'Resumed date'], ['vacated', 'Vacated date'], ['resumption', 'Resumption date'], ['date', 'Signature date']];

export function termSettings(term, canEdit) {
  const inputs = Object.fromEntries(FIELDS.map(([key]) => [key, h('input', { value: term[key] || '', disabled: !canEdit })]));
  const position = h('select', { value: term.pos || '', disabled: !canEdit }, [h('option', { value: '' }, 'No'), h('option', { value: 'yes' }, 'Yes')]);
  const save = h('button', { class: 'btn' }, 'Save term settings');
  save.onclick = () => run(save, async () => {
    await Term.save({ ...Object.fromEntries(FIELDS.map(([key]) => [key, inputs[key].value])), pos: position.value });
    toast('Term settings saved');
  });
  return card(h('h3', {}, 'Term settings'), h('div', { class: 'row' }, FIELDS.map(([key, label]) => field(label, inputs[key]))),
    field('Show position in class on sheets', position),
    canEdit ? save : h('p', { class: 'muted' }, 'Only an administrator can change term settings.'));
}
