import test from 'node:test';
import assert from 'node:assert/strict';
import {recordTraffic,recordResponse} from '../modules/traffic.js';
import {emptyState} from '../modules/config.js';
test('traffic stores hostnames only and keeps confirmed blocks separate',()=>{
  const s=emptyState();recordTraffic(s,{url:'https://ads.test/secret?token=private',initiator:'https://site.test',type:'script'});recordTraffic(s,{url:'https://ads.test/x',ruleId:1},true);
  assert.equal(s.total,1);assert.equal(s.blocked,1);assert.equal(s.thirdParty,1);
  assert.equal(s.events[0].host,'ads.test');assert.ok(!JSON.stringify(s).includes('private'));
});
test('incoming completion enriches the matching request without storing response contents',()=>{
  const s=emptyState();recordTraffic(s,{requestId:'17',url:'https://site.test'});
  recordResponse(s,{requestId:'17',statusCode:200,fromCache:true,responseHeaders:[{name:'private',value:'secret'}]});
  assert.equal(s.total,1);assert.equal(s.events[0].response,'HTTP 200 · Cached');assert.ok(!JSON.stringify(s).includes('secret'));
});
test('event retention remains bounded during high request volume',()=>{
  const s=emptyState();for(let i=0;i<500;i++)recordTraffic(s,{url:'https://example.com'});
  assert.equal(s.events.length,200);assert.equal(s.total,500);assert.equal(s.buckets[0].requests,500);
});
