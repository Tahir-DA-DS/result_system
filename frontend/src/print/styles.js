// Adds the result-sheet styles to the page once (used by every screen that shows sheets).
import sheetCss from './sheet.css?inline';
import './preview.css';

export function ensureSheetStyles() {
  if (document.getElementById('sheet-css')) return;
  const style = document.createElement('style');
  style.id = 'sheet-css';
  style.textContent = sheetCss;
  document.head.append(style);
}
