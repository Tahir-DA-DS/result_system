// Toasts and a safe way to run a button action.
export function toast(message, kind = '') {
  const box = document.getElementById('toast');
  const el = Object.assign(document.createElement('div'), { className: 'toast ' + kind, textContent: message });
  box.append(el);
  setTimeout(() => el.remove(), 4000);
}

// Disables the button while fn runs and shows any error as a toast. Returns fn's result, or undefined on error.
export async function run(button, fn) {
  if (button) button.disabled = true;
  try { return await fn(); }
  catch (e) { toast(e.message, 'error'); }
  finally { if (button) button.disabled = false; }
}
