export function httpURL(value) {
  if (typeof value !== 'string' || value.length > 8192) throw new Error('Enter a valid HTTP or HTTPS URL (maximum 8192 characters).');
  const u = new URL(value);
  if (!['http:','https:'].includes(u.protocol) || u.username || u.password) throw new Error('Only HTTP(S) URLs without embedded credentials are supported.');
  u.hash=''; return u;
}
export function host(value) { try { return new URL(value).hostname.toLowerCase().replace(/\.$/,''); } catch { return ''; } }
export function matchesHost(value, domain) { return value===domain || value.endsWith('.'+domain); }
// Host comparison intentionally does not pretend to be Public Suffix List classification.
export function thirdParty(url, initiator) { const a=host(url), b=host(initiator); return !!a && !!b && a!==b; }
export function parseHosts(text) {
  if(typeof text!=='string'||text.length>12000) throw new Error('Domain list is too large.');
  const list=[...new Set(text.split(/[\s,]+/).filter(Boolean).map(x=>x.toLowerCase().replace(/\.$/,'')))];
  if(list.length>100 || list.some(x=>x.length>253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(x))) throw new Error('Use up to 100 plain domain names, one per line; no URLs or wildcards.');
  return list;
}
