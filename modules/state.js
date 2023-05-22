import {DEFAULTS,emptyState} from './config.js';
let tail=Promise.resolve();
// Serialize every mutation: concurrent requests must never overwrite one another.
export function transact(fn) {
  const next=tail.then(async()=>{
    const {telemetry}=await chrome.storage.session.get('telemetry');
    const state=telemetry || emptyState();
    const result=await fn(state);
    await chrome.storage.session.set({telemetry:state});
    return result;
  });
  tail=next.catch(()=>{}); return next;
}
export async function settings() {return {...DEFAULTS,...(await chrome.storage.local.get('settings')).settings};}
export async function initialize() {
  await chrome.storage.local.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  await chrome.storage.session.setAccessLevel({accessLevel:'TRUSTED_CONTEXTS'});
  const prefs=await settings(); await chrome.storage.local.set({settings:prefs});
  await chrome.declarativeNetRequest.updateEnabledRulesets({enableRulesetIds:prefs.blocking?['starter']:[],disableRulesetIds:prefs.blocking?[]:['starter']});
}
