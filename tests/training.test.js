const test = require('node:test');
const assert = require('node:assert/strict');
const { judgeSubmission } = require('../miniprogram/core/techniques');

test('显性数对验证结构与删数关系，允许部分有效删数', () => {
  const position = { board: Array(81).fill(0), candidates: Array.from({length:81}, () => []) };
  position.candidates[0] = [1,2]; position.candidates[1] = [1,2]; position.candidates[2] = [1,2,3];
  assert.equal(judgeSubmission(position,'naked-pair',[0,1],[{cell:2,digit:1}]).ok,true);
  assert.equal(judgeSubmission(position,'naked-pair',[0,1],[{cell:2,digit:1},{cell:2,digit:3}]).ok,false);
  assert.equal(judgeSubmission(position,'naked-pair',[0,2],[{cell:2,digit:1}]).ok,false);
});
