const byId = id => document.getElementById(id);
const buttons = [byId('allow'), byId('block')];

function showReady() {
  if (!navigator.serviceWorker.controller) return;
  byId('ready').textContent = 'Filter ready. Both tests request the same first-party sample banner.';
  buttons.forEach(button => { button.disabled = false; });
}
async function start() {
  try {
    navigator.serviceWorker.addEventListener('controllerchange', showReady);
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    showReady();
  } catch {
    byId('ready').textContent = 'The filter requires service workers. Open this page in a browser that supports them. The URL checker still works.';
  }
}
async function testAdvertisement(filter) {
  buttons.forEach(button => { button.disabled = true; });
  try {
    const response = await fetch('banner.json?filter=' + filter);
    const blocked = response.status === 403 && response.headers.get('X-Aegis-Rule') === 'sample-ad';
    if (!response.ok && !blocked) throw new Error('Request failed');
    const banner = blocked ? null : await response.json();
    byId('slot').dataset.state = blocked ? 'blocked' : 'allowed';
    byId('result').textContent = blocked ? 'Advertisement blocked' : banner.title;
    byId('detail').textContent = blocked ? 'The local filter intercepted the request before the banner was loaded.' : banner.copy;
  } catch {
    byId('result').textContent = 'Test unavailable';
    byId('detail').textContent = 'Reload while online to initialize the offline cache.';
  } finally {
    showReady();
  }
}
byId('allow').onclick = () => testAdvertisement('off');
byId('block').onclick = () => testAdvertisement('on');
byId('check').onsubmit = event => {
  event.preventDefault();
  try {
    const url = new URL(byId('address').value);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error();
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
    const rule = self.adDomains.find(domain => hostname === domain || hostname.endsWith('.' + domain));
    byId('match').textContent = rule ? 'Matching ad rule: ' + rule : 'No matching starter rule for ' + hostname + '.';
  } catch {
    byId('match').textContent = 'Enter a valid HTTP or HTTPS resource URL.';
  }
};
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  const button = byId('install-app');
  button.hidden = false;
  button.onclick = async () => {
    button.hidden = true;
    await event.prompt();
  };
});
start();
