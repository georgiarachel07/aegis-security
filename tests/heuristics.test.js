import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePage,riskyDownload} from '../modules/heuristics.js';
test('denylist has hostname boundaries, includes subdomains, never substring matches',()=>{
  assert.equal(analyzePage('https://login.bad.test',{},['bad.test']).length,1);
  assert.equal(analyzePage('https://notbad.test',{},['bad.test']).length,0);
  assert.equal(analyzePage('https://bad.test.good.test',{},['bad.test']).length,0);
  assert.equal(analyzePage('https://phishing.aegis.test').length,1);
});
test('credential heuristics distinguish normal pages from risk signals',()=>{
  assert.deepEqual(analyzePage('https://example.com',{password:true}),[]);
  assert.equal(analyzePage('http://example.com',{password:true}).length,1);
  assert.equal(analyzePage('https://127.0.0.1',{password:true}).length,1);
  assert.equal(analyzePage('https://xn--bcher-kva.example',{password:false}).length,0);
  assert.equal(analyzePage('https://example.com',{password:true,insecureAction:true}).length,1);
});
test('download guard flags executable, archive, opaque and browser-danger items',()=>{
  for(const item of [{filename:'report.pdf.exe'},{url:'https://example.com/tool.zip?token=x'},{url:'blob:https://example.com/123'},{filename:'x.txt',danger:'uncommon'}])assert.ok(riskyDownload(item));
  assert.equal(riskyDownload({filename:'report.pdf',url:'https://example.com/report.pdf',danger:'safe'}),false);
});
