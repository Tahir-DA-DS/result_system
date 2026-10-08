// Admin: close the term (archive and start the next) and, after the Third Term, start the new session.
import { mount } from '../../ui/dom.js';
import { closeTermCard } from './closeTerm.js';
import { promotionCard } from './promotion.js';
import { backupCard } from './backup.js';

export async function render(root) {
  const draw = async () => mount(root, await closeTermCard(draw), await promotionCard(draw), backupCard());
  await draw();
}
