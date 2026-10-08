// A standalone HTML file with all the sheets (works offline; open it and print or save as PDF).
import sheetCss from './sheet.css?inline';

async function logoDataUrl() {
  const blob = await (await fetch('/logo.jpg')).blob();
  return new Promise(resolve => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsDataURL(blob); });
}

export async function downloadSheets(sheets, title) {
  const logo = await logoDataUrl();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title.replace(/[<>&]/g, '')}</title>
<link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap" rel="stylesheet">
<style>${sheetCss}
:root{--logo:url("${logo}")} body{margin:0;background:#888} .sheet{margin:0 auto 8px} @page{size:A4;margin:0}
@media print{body{background:none}.sheet{margin:0;break-after:page;background:#fff;box-shadow:none}}</style></head>
<body>${sheets.map(s => s.outerHTML).join('')}</body></html>`;
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([html], { type: 'text/html' })), download: title.replace(/\W+/g, '-') + '.html' });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
}
