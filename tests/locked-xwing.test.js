const test = require('node:test');
const assert = require('node:assert/strict');
const {judgeSubmission} = require('../miniprogram/core/techniques');
function position(entries) {
  const candidates = Array.from({length:81},()=>[]);
  for(const [cell,ns] of Object.entries(entries)) candidates[cell]=ns;
  return {board:Array(81).fill(0),candidates};
}
test('宫内候选数集中在同一行，可删除该行宫外候选数',()=>{
  const p=position({0:[1,2],1:[1,3],4:[1,4],9:[2,3]});
  assert.equal(judgeSubmission(p,'locked-candidates',[0,1],[{cell:4,digit:1}]).ok,true);
  assert.equal(judgeSubmission(p,'locked-candidates',[0,1],[{cell:9,digit:2}]).ok,false);
});
test('行列中的候选数集中在同一宫，可删除宫内其他位置',()=>{
  const row=position({0:[2],1:[2],9:[2],10:[2]});
  assert.equal(judgeSubmission(row,'locked-candidates',[0,1],[{cell:9,digit:2}]).ok,true);
  const p=position({0:[2],9:[2],1:[2],10:[2]});
  assert.equal(judgeSubmission(p,'locked-candidates',[0,9],[{cell:1,digit:2}]).ok,true);
});
test('行式 X-Wing 接受四角结构与覆盖列中的删数',()=>{
  const p=position({0:[5],3:[5],18:[5],21:[5],36:[5],39:[5],40:[5]});
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[{cell:36,digit:5}]).ok,true);
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[{cell:36,digit:5},{cell:40,digit:5}]).ok,false);
});
test('列式 X-Wing、不同有效结构均可提交，缺角或多候选位置不成立',()=>{
  const p=position({0:[5],3:[5],18:[5],21:[5],36:[5],39:[5],40:[5]});
  const transposed={board:p.board.slice(),candidates:Array.from({length:81},(_,i)=>p.candidates[i%9*9+Math.floor(i/9)])};
  assert.equal(judgeSubmission(transposed,'x-wing',[0,27,2,29],[{cell:4,digit:5}]).ok,true);
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18],[{cell:36,digit:5}]).ok,false);
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[{cell:36,digit:9}]).ok,false);
  p.candidates[5]=[5];
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[{cell:36,digit:5}]).ok,false);
});
test('区块排除不接受分散结构，也不能混入与该结构无关的删数',()=>{
  const p=position({0:[1,2],1:[1,3],4:[1,4],9:[2,3],28:[1,5],29:[1,6],33:[1,7]});
  assert.equal(judgeSubmission(p,'locked-candidates',[28,29],[{cell:33,digit:1}]).ok,true);
  assert.equal(judgeSubmission(p,'locked-candidates',[0,1],[{cell:4,digit:1},{cell:33,digit:1}]).ok,false);
  p.candidates[10]=[1,3];
  assert.equal(judgeSubmission(p,'locked-candidates',[0,1],[{cell:4,digit:1}]).ok,false);
});
test('十个教学局面各有唯一解、原始候选数和正确的目标推理',()=>{
  const {courses}=require('../miniprogram/data/locked-xwing');
  const {solve,candidatesFor}=require('../miniprogram/core/sudoku');
  const seen=new Set();
  for(const course of courses) {
    assert.equal(course.lessons.length,5);
    const independentClues=[];
    for(const lesson of course.lessons) {
      const key=lesson.board.join('');
      assert.equal(seen.has(key),false);seen.add(key);
      assert.deepEqual(solve(lesson.board),[lesson.solution]);
      assert.deepEqual(lesson.candidates,candidatesFor(lesson.board));
      assert.deepEqual(lesson.proof,[]);
      assert.equal(judgeSubmission(lesson,course.id,lesson.pattern.cells,lesson.pattern.eliminations).ok,true);
      assert(lesson.pattern.eliminations.every(e=>lesson.solution[e.cell]!==e.digit));
      if(lesson.mode==='independent') independentClues.push(lesson.board.filter(Boolean).length);
    }
    // Different clue counts rule out rotations, digit substitutions and other Sudoku symmetries.
    assert.equal(new Set(independentClues).size,3);
  }
});
test('X-Wing 不限定标准结构；同组四角必须由一种解释覆盖全部删数',()=>{
  const p=position({0:[5],3:[5],18:[5],21:[5],36:[5],39:[5],40:[5],54:[5],57:[5]});
  assert.equal(judgeSubmission(p,'x-wing',[18,21,54,57],[{cell:36,digit:5}]).ok,true);
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[{cell:40,digit:5}]).ok,false);
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,21],[]).code,'missing-elimination');
  assert.equal(judgeSubmission(p,'x-wing',[0,3,18,18],[{cell:36,digit:5}]).code,'invalid-structure');
});
