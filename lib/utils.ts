// Dispatch a stat update event consumed by TopBar
export function dispatchStat(key: string, value: string) {
  window.dispatchEvent(new CustomEvent('stat-update', { detail: { key, value } }));
}

// Shared HTML entity decoder used by the releases API
export function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&trade;/g, '\u2122')
    .replace(/&reg;/g, '\u00AE');
}
