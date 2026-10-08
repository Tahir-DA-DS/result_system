// Scales A4 sheets down to fit the screen (phones included). Printing ignores this and uses real A4.
const A4_W = 793.7, A4_H = 1122.5;   // A4 in CSS pixels at 96 dpi

export function wrapForPreview(sheets) {
  return sheets.map(sheet => { const box = document.createElement('div'); box.className = 'pvs'; box.append(sheet); return box; });
}

export function fitSheets(container) {
  const k = Math.min(1, (container.clientWidth || innerWidth) / A4_W);
  container.querySelectorAll('.pvs').forEach(box => {
    box.style.width = A4_W * k + 'px';
    box.style.height = A4_H * k + 'px';
    box.firstChild.style.transform = `scale(${k})`;
  });
}
