import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupHash,submitURL,refreshAnalysis} from '../modules/virustotal.js';
let data={apiKey:'a'.repeat(64),lastVT:0},calls=[];
globalThis.chrome={storage:{session:{async get(){return {...data};},async set(v){Object.assign(data,v);}}}};
function response(status,body){data.lastVT=0;globalThis.fetch=async(url,options)=>{calls.push({url,options});return {status,ok:status===200,async json(){return body;}};};}
test('unknown hash returns Unknown without uploading file bytes',async()=>{response(404);const result=await lookupHash('b'.repeat(64));assert.equal(result.status,'Unknown');assert.equal(calls.at(-1).options.body,undefined);});
test('URL submission stays pending until an analysis completes',async()=>{response(200,{data:{id:'abc'}});assert.equal((await submitURL('https://example.com')).status,'Pending');response(200,{data:{attributes:{status:'completed',stats:{malicious:1,harmless:9}}}});assert.equal((await refreshAnalysis('abc')).flaggedPercent,10);});
test('quota, authentication and pacing failures remain explicit',async()=>{response(429);await assert.rejects(()=>lookupHash('b'.repeat(64)),/quota/);response(401);await assert.rejects(()=>lookupHash('b'.repeat(64)),/rejected/);data.lastVT=Date.now();await assert.rejects(()=>lookupHash('b'.repeat(64)),/16 seconds/);});
