import {riskyDownload} from './heuristics.js';
import {host} from './urls.js';
import {LIMITS} from './config.js';
import {settings,transact} from './state.js';
export async function inspectDownload(item) {
  if(!(await settings()).downloads || !riskyDownload(item)) return;
  const {telemetry}=await chrome.storage.session.get('telemetry');
  if(telemetry?.downloads.some(x=>x.id===item.id))return;
  let status='Review required (not paused)';
  try {await chrome.downloads.pause(item.id);status='Paused for review';} catch {/* Completed/non-resumable downloads cannot be held. */}
  await transact(s=>{
    const record={id:item.id,name:(item.filename||'Download').split(/[\\/]/).pop(),host:host(item.finalUrl||item.url),time:Date.now(),status};
    s.downloads=s.downloads.filter(x=>x.id!==item.id);s.downloads.unshift(record);s.downloads=s.downloads.slice(0,LIMITS.downloads);
  });
  await chrome.action.setBadgeBackgroundColor({color:'#cf792c'});
  await chrome.action.setBadgeText({text:'!'});
}
export async function actOnDownload(id,action) {
  if(!Number.isInteger(id)||!['resume','cancel'].includes(action)) throw new Error('Invalid download action.');
  const {telemetry}=await chrome.storage.session.get('telemetry');
  if(!telemetry?.downloads.some(x=>x.id===id)) throw new Error('Download is not in the review list.');
  await chrome.downloads[action](id);
  await transact(s=>{const item=s.downloads.find(x=>x.id===id);if(item)item.status=action==='resume'?'Resumed by you — unverified':'Cancelled';});
}
