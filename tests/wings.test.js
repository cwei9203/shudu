const test = require('node:test');
const assert = require('node:assert/strict');
const {judgeSubmission} = require('../miniprogram/core/techniques');
const position = entries => {
  const p = {board:Array(81).fill(0),candidates:Array.from({length:81},()=>[])};
  for(const [cell,ns] of entries) p.candidates[cell]=ns;
  return p;
};
test('XY-Wing 由用户选择推断枢纽，并接受有效删数',()=>{
  const p=position([[0,[1,2]],[3,[1,3]],[27,[2,3]],[30,[3,4]]]);
  assert.equal(judgeSubmission(p,'xy-wing',[27,0,3],[{cell:30,digit:3}]).ok,true);
});
test('XYZ-Wing 删除目标必须同时看到枢纽和两翼',()=>{
  const p=position([[0,[1,2,3]],[1,[1,3]],[27,[2,3]],[9,[3,4]],[28,[3,5]]]);
  assert.equal(judgeSubmission(p,'xyz-wing',[1,27,0],[{cell:9,digit:3}]).ok,true);
  assert.equal(judgeSubmission(p,'xyz-wing',[0,1,27],[{cell:28,digit:3}]).ok,false);
  assert.equal(judgeSubmission(p,'xyz-wing',[0,1,27],[{cell:9,digit:3},{cell:28,digit:3}]).ok,false);
  assert.equal(judgeSubmission(p,'xyz-wing',[0,1,27],[{cell:9,digit:4}]).ok,false);
  assert.equal(judgeSubmission(p,'xyz-wing',[0,1,9],[{cell:9,digit:3}]).ok,false);
});
test('同一局面接受另一组有效 XY-Wing，拒绝不存在或无关删数',()=>{
  const p=position([[0,[1,2]],[3,[1,3]],[27,[2,3]],[30,[3,4]], [40,[5,6]],[43,[5,7]],[67,[6,7]],[70,[7,8]]]);
  assert.equal(judgeSubmission(p,'xy-wing',[43,67,40],[{cell:70,digit:7}]).ok,true);
  assert.equal(judgeSubmission(p,'xy-wing',[0,3,27],[{cell:70,digit:7}]).ok,false);
  assert.equal(judgeSubmission(p,'xy-wing',[0,3,27],[{cell:30,digit:9}]).ok,false);
  assert.equal(judgeSubmission(p,'xy-wing',[0,3,27],[{cell:30,digit:3},{cell:30,digit:4}]).ok,false);
  p.candidates[27]=[1,3];
  assert.equal(judgeSubmission(p,'xy-wing',[0,3,27],[{cell:30,digit:3}]).ok,false);
});
test('Wing 题库十个局面都有唯一解、有效前序推导和可提交结构',()=>{
  const {courses}=require('../miniprogram/data/wings');
  const {solve,candidatesFor,units}=require('../miniprogram/core/sudoku');
  const boards=new Set();
  for(const course of courses) {
    assert.equal(course.lessons.length,5);
    for(const lesson of course.lessons) {
      const original=lesson.originalBoard||lesson.board;
      assert.equal(boards.has(original.join('')),false);boards.add(original.join(''));
      const solutions=solve(original,2);
      assert.equal(solutions.length,1);
      assert.deepEqual(solutions[0],lesson.solution);
      const replay=original.slice();
      for(const proof of lesson.proof) {
        const candidates=candidatesFor(replay);
        assert.equal(replay[proof.cell],0);
        assert.equal(candidates[proof.cell].includes(proof.digit),true);
        assert.equal(candidates[proof.cell].length===1||units.some(u=>u.includes(proof.cell)&&u.filter(i=>candidates[i].includes(proof.digit)).length===1),true);
        replay[proof.cell]=proof.digit;
      }
      assert.deepEqual(replay,lesson.board);
      assert.deepEqual(candidatesFor(replay),lesson.candidates);
      assert.equal(judgeSubmission(lesson,course.id,lesson.pattern.cells,lesson.pattern.eliminations).ok,true);
      for(const e of lesson.pattern.eliminations) assert.notEqual(lesson.solution[e.cell],e.digit);
    }
  }
});
test('XYZ-Wing 认可第二组结构；候选数组合或可见关系错误不能通过',()=>{
  const p=position([[0,[1,2,3]],[1,[1,3]],[27,[2,3]],[9,[3,4]], [40,[5,6,7]],[41,[5,7]],[67,[6,7]],[49,[7,8]]]);
  assert.equal(judgeSubmission(p,'xyz-wing',[67,41,40],[{cell:49,digit:7}]).ok,true);
  assert.equal(judgeSubmission(p,'xyz-wing',[0,1,27],[{cell:49,digit:7}]).ok,false);
  p.candidates[67]=[6,8];
  assert.equal(judgeSubmission(p,'xyz-wing',[67,41,40],[{cell:49,digit:7}]).ok,false);
  p.candidates[68]=[6,7];
  assert.equal(judgeSubmission(p,'xyz-wing',[68,41,40],[{cell:49,digit:7}]).ok,false);
});
