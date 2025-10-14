export const isDebug: boolean = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    if ((params.get('debug') || '').toLowerCase() === 'on') return true;
    const v = (localStorage.getItem('debug') || '').toLowerCase();
    return v === 'true' || v === '1' || v === 'on';
  } catch {
    return false;
  }
})();

export function debugLog(...args: any[]): void {
  if (!isDebug) return;
  try {
    // eslint-disable-next-line no-console
    console.log(...args);
  } catch {}
}