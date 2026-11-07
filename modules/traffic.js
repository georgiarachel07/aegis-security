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
  s.events.unshift({time:now,host:host(d.url),source:host(d.initiator),type:d.type||'other',status:blocked?'Blocked by Aegis':'Observed',third,rule:d.ruleId||null});
  s.events=s.events.slice(0,LIMITS.events);
}
