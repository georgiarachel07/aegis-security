import {$,element,empty,time,action} from './modules/dom.js';
import {drawTraffic} from './modules/chart.js';
let latest=null,busy=false,loadedSettings=false;
async function api(type,data={}) {
  if(!globalThis.chrome?.runtime?.sendMessage)throw new Error('Load this folder as an unpacked extension, then click its toolbar icon. This page needs extension APIs.');
  const reply=await chrome.runtime.sendMessage({type,...data});
  if(!reply?.ok)throw new Error(reply?.error||'The extension did not respond. Reload it from the extensions page.');return reply.data;
}
function notify(text,error=false){$('notice').textContent=text;$('notice').className=error?'error':'';}
async function perform(fn,message){try{await fn();if(message)notify(message);await refresh();}catch(error){notify(error.message,true);}}
const modules=[['blocking','Ad & tracker blocker','24 starter domains · declarative network rules'],['phishing','Phishing signals','Local denylist and credential-page heuristics'],['monitoring','Network monitoring','Session-only request and rule-match logs'],['downloads','Download review','Best-effort pause of suspicious downloads'],['scanning','Reputation checks','Consent-based VirusTotal URL and hash queries']];
for(const [key,title,description] of modules){const label=element('label',undefined,'toggle'),copy=element('span'),input=element('input');copy.append(element('strong',title),element('small',description));input.type='checkbox';input.id='toggle-'+key;input.onchange=async()=>{input.disabled=true;await perform(()=>api('setting',{key,value:input.checked}),'Preference saved.');input.disabled=false;await refresh();};label.append(copy,input);$('toggles').append(label);}
function render(data){
  latest=data;const s=data.state;
  $('connection').textContent=data.settings.monitoring?'Monitoring active':'Monitoring paused';
  $('protection-title').textContent=data.settings.blocking?'Starter blocking is active.':'Starter blocking is paused.';
  for(const [id,value] of [['total',s.total],['blocked',s.blocked],['third',s.thirdParty],['alert-count',s.alerts.length]])$(id).textContent=value.toLocaleString();
  $('key-status').textContent=data.hasKey?'· Key saved for this session':'· Not configured';
  for(const [key]of modules)if(!$('toggle-'+key).disabled)$('toggle-'+key).checked=data.settings[key];
  if(!loadedSettings){$('denylist').value=data.settings.deniedHosts.join('\n');loadedSettings=true;}
  const rows=drawTraffic($('traffic-chart'),s.buckets);$('chart-data').replaceChildren(...rows.slice().reverse().map(b=>{const tr=element('tr');tr.append(element('td',time(b.time)),element('td',b.requests),element('td',b.blocked));return tr;}));
  renderEvents();renderAlerts(s.alerts);renderScans(s.scans);renderDownloads(s.downloads);
}
function renderEvents(){const filter=$('traffic-filter').value;const events=latest.state.events.filter(e=>filter==='all'||(filter==='blocked'?e.status==='Blocked by Aegis':e.third)).slice(0,40);$('events').replaceChildren(...events.map(e=>{const tr=element('tr');tr.append(element('td',time(e.time)),element('td',e.host||'Unknown host'),element('td',e.type),element('td',e.status+(e.third?' · Third-party':'')));return tr;}));if(!events.length){const tr=element('tr'),td=element('td','No matching connections yet. Browse a normal website to begin.');td.colSpan=4;tr.append(td);$('events').append(tr);}}
function renderAlerts(alerts){if(!alerts.length)return empty($('alerts'),'No page warnings recorded in this session. This does not certify visited pages as safe.');$('alerts').replaceChildren(...alerts.map(a=>{const item=element('article',undefined,'item');item.append(element('h3',a.host),element('p',a.reasons.join(' ')),element('span',time(a.time),'flag'));return item;}));}
function renderScans(scans){if(!scans.length)return empty($('scans'),'No reputation checks yet. Add your key to get started.');$('scans').replaceChildren(...scans.map(scan=>{const item=element('article',undefined,'item');item.append(element('h3',scan.kind+' · '+scan.status),element('p',scan.host||scan.hash),element('p',scan.flaggedPercent===null?'No completed verdict available.':`${scan.malicious+scan.suspicious} / ${scan.total} reporting engines flagged this indicator (${scan.flaggedPercent}%). Not a safety probability.`));if(scan.analyzedAt)item.append(element('p','Report date: '+new Date(scan.analyzedAt*1000).toLocaleString()));if(scan.analysisId&&scan.status==='Pending')item.append(action('Refresh analysis',()=>perform(()=>api('refreshScan',{id:scan.id}),'Analysis refreshed.')));return item;}));}
function renderDownloads(downloads){if(!downloads.length)return empty($('download-list'),'No risky downloads recorded. The download guard is ready when enabled.');$('download-list').replaceChildren(...downloads.map(d=>{const item=element('article',undefined,'item');item.append(element('h3',d.name),element('p',d.host||'Local or opaque download source'),element('span',d.status,'flag'));if(d.status==='Paused for review'){item.append(action('Resume at my own risk',()=>{if(confirm('This file has not been verified safe. Resume the download?'))perform(()=>api('download',{id:d.id,action:'resume'}),'Download resumed by your choice.');}),action('Cancel download',()=>perform(()=>api('download',{id:d.id,action:'cancel'}),'Download cancelled.')));}return item;}));}
async function refresh(){if(busy)return;busy=true;try{render(await api('snapshot'));}catch(error){$('connection').textContent='Connection unavailable';notify(error.message,true);}finally{busy=false;}}
$('traffic-filter').onchange=()=>latest&&renderEvents();
$('key-form').onsubmit=event=>{event.preventDefault();perform(async()=>{await api('key',{value:$('api-key').value});$('api-key').value='';},'API key saved for this browser session.');};
$('forget-key').onclick=()=>perform(()=>api('key',{value:''}),'API key removed.');
$('deny-form').onsubmit=event=>{event.preventDefault();perform(()=>api('denylist',{value:$('denylist').value}),'Domain list saved. Reload open pages to apply.');};
$('clear').onclick=()=>{if(confirm('Clear session logs and results? Paused downloads will remain paused; manage them in your browser Downloads page.'))perform(()=>api('clear'),'Session history cleared.');};
$('scan-form').onsubmit=async event=>{
  event.preventDefault();const button=$('scan-button');button.disabled=true;$('scan-feedback').textContent='Preparing reputation check…';
  try{
    const url=$('scan-url').value.trim(),file=$('scan-file').files[0],consent=$('consent').checked;
    if(!!url===!!file)throw new Error('Enter a URL OR select a file, not both.');
    if(!consent)throw new Error('Consent is required before sharing an indicator.');
    if(file){if(file.size>50*1024*1024)throw new Error('Choose a file no larger than 50 MiB.');const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');await api('scanHash',{value:hash,consent});}
    else await api('scanURL',{value:url,consent});
    $('scan-feedback').textContent='Check recorded. Pending URL analyses can be refreshed after 16 seconds.';await refresh();
  }catch(error){$('scan-feedback').textContent=error.message;notify(error.message,true);}finally{button.disabled=false;}
};
// Refresh only visible dashboards. No simulated or randomized telemetry.
setInterval(()=>{if(!document.hidden)refresh();},3000);
window.addEventListener('resize',()=>{if(latest)drawTraffic($('traffic-chart'),latest.state.buckets);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
refresh();
