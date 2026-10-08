// Download a backup of everything as one file. (The browser address bar cannot do this: the request needs your sign-in token.)
import { h, card } from '../../ui/dom.js';
import { run, toast } from '../../ui/feedback.js';
import { Backup } from '../../api/endpoints.js';

export function backupCard() {
  const button = h('button', { class: 'btn' }, 'Download backup');
  button.onclick = () => run(button, async () => {
    const data = await Backup.get();
    const link = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })),
      download: `bright-hills-backup-${new Date().toISOString().slice(0, 10)}.json`,
    });
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 5000);
    toast('Backup downloaded. Keep a copy somewhere safe, away from this computer.');
  });
  return card(h('h3', {}, 'Backup'),
    h('p', { class: 'muted' }, 'Downloads staff (without passwords), classes, pupils, scores, reports, term settings and the archive of closed terms. Do this every week and before closing a term.'),
    h('div', { class: 'row' }, button));
}
