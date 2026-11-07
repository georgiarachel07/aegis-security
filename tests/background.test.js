import test from 'node:test';
import assert from 'node:assert/strict';
const events={};
const event=name=>({addListener(fn){events[name]=fn;}});
function area(){let data={};return {async get(keys){return Object.fromEntries((Array.isArray(keys)?keys:[keys]).filter(k=>data[k]!==undefined).map(k=>[k,structuredClone(data[k])]));},async set(value){Object.assign(data,structuredClone(value));},async setAccessLevel(){}};}
let enabled=['starter'];
globalThis.chrome={storage:{session:area(),local:area()},runtime:{id:'test',getURL:path=>'chrome-extension://test/'+path,onInstalled:event('installed'),onStartup:event('startup'),onMessage:event('message')},action:{onClicked:event('click'),async setBadgeText(){},async setBadgeBackgroundColor(){}},tabs:{async create(){},async update(){}},alarms:{async create(){},onAlarm:event('alarm')},webRequest:{onBeforeRequest:event('request')},declarativeNetRequest:{async updateEnabledRulesets(o){enabled=o.enableRulesetIds;},async getEnabledRulesets(){return enabled;},onRuleMatchedDebug:event('rule')},downloads:{onCreated:event('download'),onChanged:event('downloadChange'),async search(){return [];},async pause(){},async resume(){},async cancel(){}}};
await import('../background.js');
const dashboard={id:'test',url:'chrome-extension://test/dashboard.html'};
const page={id:'test',url:'http://example.com',tab:{id:3},frameId:0};
const send=(msg,sender=dashboard)=>new Promise(resolve=>events.message(msg,sender,resolve));
test('page messages cannot access keys, settings or scan APIs',async()=>{
  for(const type of ['snapshot','key','setting','scanURL','clear','download'])assert.equal((await send({type},page)).ok,false);
  const reply=await send({type:'analyze',signals:{password:true},url:'https://safe.test'},page);
  assert.equal(reply.data.reasons.length,1); // trusts sender URL, not supplied URL
});
test('invalid settings cannot alter defaults and DNR tracks valid toggles',async()=>{
  assert.equal((await send({type:'setting',key:'__proto__',value:true})).ok,false);
  assert.equal((await send({type:'setting',key:'blocking',value:false})).ok,true);
  assert.equal((await send({type:'snapshot'})).data.settings.blocking,false);
  await send({type:'setting',key:'blocking',value:true});
});
test('scan requires explicit consent and saved keys never appear in snapshots',async()=>{
  await send({type:'key',value:'a'.repeat(64)});
  const snapshot=await send({type:'snapshot'});assert.equal(snapshot.data.hasKey,true);assert.ok(!JSON.stringify(snapshot).includes('a'.repeat(64)));
  const response=await send({type:'scanURL',value:'https://example.com'});assert.equal(response.ok,false);assert.match(response.error,/Confirm sharing/);
});
test('serialized state changes retain concurrent counts',async()=>{
  const {transact}=await import('../modules/state.js');
  await Promise.all(Array.from({length:25},()=>transact(s=>{s.total++;})));
  assert.equal((await send({type:'snapshot'})).data.state.total,25);
});

