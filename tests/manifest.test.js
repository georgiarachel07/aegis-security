import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url),read=path=>readFileSync(new URL(path,root),'utf8');
test('manifest resources exist and MV3 has no remote executable dependencies',()=>{
  const m=JSON.parse(read('manifest.json'));
  assert.equal(m.manifest_version,3);assert.equal(m.author,'Georgia Rachel');
  assert.equal(m.background.type,'module');assert.ok(!m.action.default_popup);
  for(const p of [m.background.service_worker,...m.content_scripts.flatMap(x=>x.js),...m.declarative_net_request.rule_resources.map(x=>x.path)])assert.ok(existsSync(new URL(p,root)));
  assert.ok(!m.permissions.includes('webRequestBlocking'));assert.ok(!read('dashboard.html').includes('<script src="https:'));
  assert.ok(read('dashboard.html').includes('Made by Georgia Rachel'));
});
test('rules have unique IDs and precise host anchors',()=>{
  const rules=JSON.parse(read('rules.json'));assert.equal(rules.length,24);
  assert.equal(new Set(rules.map(r=>r.id)).size,rules.length);
  for(const rule of rules){assert.equal(rule.action.type,'block');assert.match(rule.condition.urlFilter,/^\|\|[a-z0-9.-]+\^$/);assert.ok(!rule.condition.resourceTypes.includes('main_frame'));}
});
