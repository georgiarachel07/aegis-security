import test from 'node:test';
import assert from 'node:assert/strict';
import {verdict} from '../modules/verdict.js';
test('empty and pending reports cannot be represented as safe',()=>{
  assert.equal(verdict({}).status,'Unknown');
  assert.equal(verdict({status:'queued',stats:{harmless:10}}).flaggedPercent,null);
  assert.equal(verdict({stats:{timeout:5,failure:4}}).total,0);
});
test('detection ratio is computed only from reporting engines',()=>{
  const result=verdict({stats:{malicious:2,suspicious:1,harmless:3,undetected:4,timeout:6}});
  assert.equal(result.flaggedPercent,30);assert.equal(result.status,'Malicious detections');
  assert.equal(verdict({stats:{undetected:10}}).status,'No detections reported');
});
