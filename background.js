// Aegis Shield — made by Georgia Rachel. All listeners register synchronously.
import {DEFAULTS,LIMITS,emptyState} from './modules/config.js';
import {settings,initialize,transact} from './modules/state.js';
import {recordTraffic,recordResponse} from './modules/traffic.js';
import {analyzePage} from './modules/heuristics.js';
import {parseHosts,host} from './modules/urls.js';
import {submitURL,lookupHash,refreshAnalysis} from './modules/virustotal.js';
import {inspectDownload,actOnDownload} from './modules/downloads.js';
const ready=initialize();
const run=fn=>ready.then(fn).catch(error=>console.warn('Aegis:',error.message));
chrome.action.onClicked.addListener(()=>chrome.tabs.create({url:chrome.runtime.getURL('dashboard.html')}));
chrome.runtime.onInstalled.addListener(()=>run(()=>chrome.alarms.create('aegis-maintenance',{periodInMinutes:1})));
chrome.runtime.onStartup.addListener(()=>run(()=>chrome.alarms.create('aegis-maintenance',{periodInMinutes:1})));
chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='aegis-maintenance')run(()=>transact(s=>{s.buckets=s.buckets.filter(b=>b.time>Date.now()-3600000);}));});
chrome.webRequest.onBeforeRequest.addListener(d=>{
  if(d.tabId<0)return; // Exclude extension/API traffic and browser background traffic.
  run(async()=>{if((await settings()).monitoring)await transact(s=>recordTraffic(s,d));});
},{urls:['http://*/*','https://*/*']});
const responseListener=d=>{if(d.tabId>=0)run(async()=>{if((await settings()).monitoring)await transact(s=>recordResponse(s,d));});};
chrome.webRequest.onCompleted.addListener(responseListener,{urls:['http://*/*','https://*/*']});
chrome.webRequest.onErrorOccurred.addListener(responseListener,{urls:['http://*/*','https://*/*']});
// Exact rule-match events are available for this UNPACKED development build only.
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener(info=>run(async()=>{
  if((await settings()).monitoring && info.rule.rulesetId==='starter') await transact(s=>recordTraffic(s,{...info.request,ruleId:info.rule.ruleId},true));
}));
chrome.downloads.onCreated.addListener(item=>run(()=>inspectDownload(item)));
chrome.downloads.onChanged.addListener(delta=>{
  if(delta.filename||delta.danger)run(async()=>{const [item]=await chrome.downloads.search({id:delta.id});if(item)await inspectDownload(item);});
});
function dashboardSender(sender) {return sender.id===chrome.runtime.id && sender.url?.split('#')[0]===chrome.runtime.getURL('dashboard.html');}
let commandTail=Promise.resolve();
async function handle(message,sender) {
  await ready;
  if(!message||typeof message.type!=='string')throw new Error('Invalid message.');
  const prefs=await settings();
  // A page can only request analysis of its OWN top-level URL and leave that tab.
  if(message.type==='analyze') {
    if(!sender.tab||sender.frameId!==0||!/^https?:/.test(sender.url||''))throw new Error('Unsupported page.');
    if(!prefs.phishing)return {reasons:[]};
    const reasons=analyzePage(sender.url,{password:message.signals?.password===true,insecureAction:message.signals?.insecureAction===true},prefs.deniedHosts);
    if(reasons.length)await transact(s=>{
      const hostname=host(sender.url);
      if(!s.alerts.some(a=>a.host===hostname&&Date.now()-a.time<60000)){s.alerts.unshift({host:hostname,reasons,time:Date.now()});s.alerts=s.alerts.slice(0,LIMITS.alerts);}
    });
    return {reasons};
  }
  if(message.type==='leave') {
    if(!sender.tab||sender.frameId!==0)throw new Error('Unsupported page.');
    await chrome.tabs.update(sender.tab.id,{url:'about:blank'});return {};
  }
  if(!dashboardSender(sender))throw new Error('This action is restricted to the Aegis dashboard.');
  switch(message.type) {
    case 'snapshot': {
      const data=await chrome.storage.session.get(['telemetry','apiKey']);
      const enabled=await chrome.declarativeNetRequest.getEnabledRulesets();
      return {settings:{...prefs,blocking:enabled.includes('starter')},state:data.telemetry||emptyState(),hasKey:!!data.apiKey};
    }
    case 'setting': {
      if(!Object.hasOwn(DEFAULTS,message.key)||typeof DEFAULTS[message.key]!=='boolean'||typeof message.value!=='boolean')throw new Error('Invalid preference.');
      if(message.key==='blocking')await chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds:message.value?['starter']:[],disableRulesetIds:message.value?[]:['starter']});
      await chrome.storage.local.set({settings:{...prefs,[message.key]:message.value}});return {};
    }
    case 'denylist': await chrome.storage.local.set({settings:{...prefs,deniedHosts:parseHosts(message.value)}});return {};
    case 'key': {
      if(typeof message.value!=='string'||(message.value&&!/^[a-f0-9]{64}$/i.test(message.value.trim())))throw new Error('Expected a 64-character VirusTotal API key.');
      await chrome.storage.session.set({apiKey:message.value.trim()});return {};
    }
    case 'scanURL': case 'scanHash': {
      if(!prefs.scanning)throw new Error('Enable reputation checks first.');
      if(message.consent!==true)throw new Error('Confirm sharing with VirusTotal first.');
      const result=message.type==='scanURL'?await submitURL(message.value):await lookupHash(message.value);
      const scan={...result,id:crypto.randomUUID(),time:Date.now()};
      await transact(s=>{s.scans.unshift(scan);s.scans=s.scans.slice(0,LIMITS.scans);});return scan;
    }
    case 'refreshScan': {
      if(!prefs.scanning)throw new Error('Enable reputation checks first.');
      const {telemetry}=await chrome.storage.session.get('telemetry');
      const scan=telemetry?.scans.find(x=>x.id===message.id);
      if(!scan?.analysisId)throw new Error('No analysis to refresh.');
      const result=await refreshAnalysis(scan.analysisId);
      await transact(s=>{const saved=s.scans.find(x=>x.id===message.id);if(saved)Object.assign(saved,result);});return result;
    }
    case 'download': await actOnDownload(message.id,message.action);return {};
    case 'downloadSource': {
      const {telemetry}=await chrome.storage.session.get('telemetry');
      if(!Number.isInteger(message.id)||!telemetry?.downloads.some(d=>d.id===message.id))throw new Error('Unknown review item.');
      const [item]=await chrome.downloads.search({id:message.id});
      const url=item?.finalUrl||item?.url;
      if(!/^https?:\/\//i.test(url||''))throw new Error('No HTTP(S) source is available. Check the file hash instead.');
      return {url}; // Preview only. A separate consented scan is required to share it.
    }
    case 'clear': await transact(s=>Object.assign(s,emptyState()));await chrome.action.setBadgeText({text:''});return {};
    default:throw new Error('Unknown action.');
  }
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
  // Dashboard mutations (including API rate limits) are serial, page analysis stays independent.
  const task=dashboardSender(sender)&&message?.type!=='snapshot' ? commandTail.then(()=>handle(message,sender)):handle(message,sender);
  if(dashboardSender(sender)&&message?.type!=='snapshot')commandTail=task.catch(()=>{});
  task.then(data=>reply({ok:true,data}),error=>reply({ok:false,error:error.message}));return true;
});
