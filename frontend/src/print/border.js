// The decorative green tick border, drawn as SVG: tilted ticks along each edge plus curled corners.
const W = 210, H = 297;      // A4 in millimetres
const INSET = 5.2;           // distance of the border from the page edge
const GAP = 4.1;             // spacing between ticks
const GREEN = '#2e7d32';

const tick = (x, y, angle) => `<path transform="translate(${x} ${y}) rotate(${angle})" d="M-1.1,0 L0,1.5 L1.7,-1.6"/>`;
const curl = (x, y, flipX, flipY) =>
  `<path transform="translate(${x} ${y}) scale(${flipX} ${flipY})" d="M0,0 C3,-1 5,1 3,3 C2,4 0.5,3 1.5,2 M0,0 C-1,3 1,5 3,3" fill="none" stroke-width=".6"/>`;

function borderMarkup() {
  let marks = '';
  for (let x = INSET + 6; x < W - INSET - 5; x += GAP) marks += tick(x, INSET, 55) + tick(x, H - INSET, -55);    // top and bottom
  for (let y = INSET + 6; y < H - INSET - 5; y += GAP) marks += tick(INSET, y, 25) + tick(W - INSET, y, -25);   // left and right
  marks += curl(INSET - 1, INSET - 1, 1, 1) + curl(W - INSET + 1, INSET - 1, -1, 1)
         + curl(INSET - 1, H - INSET + 1, 1, -1) + curl(W - INSET + 1, H - INSET + 1, -1, -1);                   // corners
  return `<svg class="bd" viewBox="0 0 ${W} ${H}" fill="none" stroke="${GREEN}" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round">${marks}</svg>`;
}

export function borderElement() {
  const template = document.createElement('template');
  template.innerHTML = borderMarkup();   // numbers only, no user text
  return template.content.firstChild;
}
