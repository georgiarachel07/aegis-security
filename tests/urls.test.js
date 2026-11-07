import test from 'node:test';
import assert from 'node:assert/strict';
import {httpURL,parseHosts,thirdParty} from '../modules/urls.js';
test('scan URL input excludes unsafe schemes and credentials',()=>{
  for(const value of ['javascript:alert(1)','file:///etc/passwd','https://user:secret@example.com',null])assert.throws(()=>httpURL(value));
  assert.equal(httpURL('https://example.com/a#private').href,'https://example.com/a');
});
test('denylist validation is bounded and normalized',()=>{
  assert.deepEqual(parseHosts('Example.com\nexample.com\na.test'),['example.com','a.test']);
  for(const value of ['https://example.com','*.example.com','example.com/path','-bad.test'])assert.throws(()=>parseHosts(value));
});
test('third-party means different hostname, not corporate ownership',()=>{
  assert.equal(thirdParty('https://a.example.com','https://b.example.com'),true);
  assert.equal(thirdParty('https://example.com/a','https://example.com/b'),false);
  assert.equal(thirdParty('https://example.com',undefined),false);
});
