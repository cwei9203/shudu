const test=require('node:test'),assert=require('node:assert/strict');
const {courses}=require('../miniprogram/data/lessons');
const puzzles=require('../miniprogram/data/puzzles');
const {solve,candidatesFor,units}=require('../miniprogram/core/sudoku');
const {judgeSubmission}=require('../miniprogram/core/techniques');
for(const course of courses) test(`${course.title}：五个不同的唯一解局面与有效推理`,()=>{
 assert.equal(course.lessons.length,5);assert.equal(course.lessons.filter(l=>l.mode==='independent').length,3);
 assert.equal(new Set(course.lessons.map(l=>l.board.join(''))).size,5);
 for(const lesson of course.lessons) {
  let replay=(lesson.originalBoard||lesson.board).slice();
  assert.deepEqual(solve(replay,2),[lesson.solution],`${lesson.id} source unique`);
  for(const step of lesson.proof) {
   assert.equal(step.type,'single');
   const available=candidatesFor(replay);
   assert.equal(replay[step.cell],0);assert.ok(available[step.cell].includes(step.digit));
   assert.ok(available[step.cell].length===1||units.some(u=>u.includes(step.cell)&&u.filter(i=>available[i].includes(step.digit)).length===1),'Single deduction must be justified by candidates');
   replay[step.cell]=step.digit;
  }
  assert.deepEqual(replay,lesson.board,'Proof must replay to the training board');
  const answers=solve(lesson.board,2);assert.equal(answers.length,1,lesson.id);assert.deepEqual(answers[0],lesson.solution);
  const base=candidatesFor(lesson.board);
  for(let i=0;i<81;i++) {if(!lesson.board[i])assert.ok(lesson.candidates[i].includes(lesson.solution[i]),`${lesson.id} cell ${i} retains solution`);assert.ok(lesson.candidates[i].every(d=>base[i].includes(d)));}
  assert.deepEqual(lesson.candidates,base,'Single-only proof must retain all remaining basic candidates');
  assert.equal(judgeSubmission(lesson,course.id,lesson.pattern.cells,lesson.pattern.eliminations).ok,true,lesson.id);
  for(const e of lesson.pattern.eliminations) assert.notEqual(lesson.solution[e.cell],e.digit);
  assert.ok(lesson.steps.length>=3);
 }
});
test('六道自由玩题目均具有唯一解',()=>{assert.equal(puzzles.length,6);assert.equal(new Set(puzzles.map(p=>p.board.join(''))).size,6);for(const p of puzzles) assert.deepEqual(solve(p.board,2),[p.solution]);});

function clueSignature(board) {
 const variants=[];
 for(let flip=0;flip<2;flip++) for(let rotation=0;rotation<4;rotation++) {
  const mask=Array(81);
  for(let i=0;i<81;i++) {let r=Math.floor(i/9),c=i%9;if(flip)c=8-c;for(let k=0;k<rotation;k++)[r,c]=[c,8-r];mask[r*9+c]=board[i]?1:0;}
  variants.push(mask.join(''));
 }
 return variants.sort()[0];
}
test('独立题不能只是旋转、反射或数字置换',()=>{
 const signatures=courses.flatMap(c=>c.lessons.filter(l=>l.mode==='independent').map(l=>clueSignature(l.originalBoard||l.board)));
 assert.equal(new Set(signatures).size,signatures.length);
});
