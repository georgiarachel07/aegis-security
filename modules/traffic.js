import {LIMITS} from './config.js';
import {host,thirdParty} from './urls.js';
export function recordTraffic(s,d,blocked=false) {
  const now=Date.now(), minute=Math.floor(now/60000)*60000;
  s.buckets=s.buckets.filter(b=>b.time>=minute-(LIMITS.buckets-1)*60000);
  let bucket=s.buckets.find(b=>b.time===minute);
  if(!bucket) {bucket={time:minute,requests:0,blocked:0};s.buckets.push(bucket);}
  if(blocked) {s.blocked++;bucket.blocked++;} else {s.total++;bucket.requests++;}
  const third=thirdParty(d.url,d.initiator);
  if(!blocked&&third) s.thirdParty++;
  s.events.unshift({time:now,requestId:d.requestId||null,host:host(d.url),source:host(d.initiator),type:d.type||'other',status:blocked?'Blocked by Aegis':'Observed',third,rule:d.ruleId||null});
  s.events=s.events.slice(0,LIMITS.events);
}
// Enrich the matching outbound event without counting its response as a new request.
// No response headers, body, or full URL are retained.
export function recordResponse(state,details){
  const event=state.events.find(e=>!e.rule&&e.requestId===details.requestId);
  if(!event)return;
  event.response=details.error?'Request failed':`HTTP ${details.statusCode}`;
  if(details.fromCache)event.response+=' · Cached';
}
