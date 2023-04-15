import {host,matchesHost} from './urls.js';
// Reserved .test names are deterministic fixtures, NOT a live threat feed.
export const TEST_DENYLIST=['phishing.aegis.test'];
export function analyzePage(url, signals={}, denied=[]) {
  let u; try {u=new URL(url);} catch {return [];}
  const hostname=host(url), reasons=[];
  if([...TEST_DENYLIST,...denied].some(d=>matchesHost(hostname,d))) reasons.push('This host matches your local denylist.');
  if(signals.password===true && u.protocol==='http:') reasons.push('A password field is served over unencrypted HTTP.');
  if(signals.password===true && signals.insecureAction===true) reasons.push('This password form submits to an unencrypted HTTP address.');
  if(u.username || u.password) reasons.push('The address contains embedded credentials that may disguise its destination.');
  if(signals.password===true && hostname.split('.').some(x=>x.startsWith('xn--'))) reasons.push('A password page uses an internationalized domain. Verify its spelling carefully.');
  if(signals.password===true && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname)) reasons.push('This password page uses a numeric IP address instead of a domain.');
  return reasons;
}
export function riskyDownload(item) {
  const name=(item.filename || '')+' '+(item.url || '').split(/[?#]/)[0];
  return /\.(exe|msi|msix|bat|cmd|ps1|vbs|js|jar|scr|com|dll|apk|dmg|pkg|iso|zip|rar|7z)(?:\s|$)/i.test(name) || /^(blob|data):/i.test(item.url||'') || (item.danger && item.danger!=='safe');
}
