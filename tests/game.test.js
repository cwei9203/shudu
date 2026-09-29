const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, applyAction, restoreGame } = require('../miniprogram/core/game');
const puzzles = require('../miniprogram/data/puzzles');
const puzzle = puzzles[0];
test('自由玩保留题目数字，笔记、输入、擦除都能撤销且不修改旧状态', () => {
 const initial = createGame(puzzle, 1000);
 assert.equal(applyAction(initial, {type:'digit',cell:0,digit:1}, 1100).board[0], 4);
 const noted = applyAction(initial, {type:'note',cell:2,digit:5}, 1200);
 assert.deepEqual(noted.notes[2], [5]);
 assert.deepEqual(initial.notes[2], []);
 const filled = applyAction(noted, {type:'digit',cell:2,digit:5}, 1300);
 assert.equal(filled.board[2], 5);
 assert.deepEqual(filled.notes[2], []);
 const erased = applyAction(filled, {type:'erase',cell:2}, 1400);
 assert.equal(erased.board[2], 0);
 const undone = applyAction(erased, {type:'undo'}, 1500);
 assert.equal(undone.board[2], 5);
 const noteAgain = applyAction(applyAction(undone, {type:'undo'}, 1600), {type:'note',cell:2,digit:5}, 1700);
 assert.deepEqual(noteAgain.notes[2], []);
});
test('重复数字报告所有冲突，合法填完才结束并停止计时', () => {
 let game=createGame(puzzle, 1000);
 game=applyAction(game,{type:'digit',cell:2,digit:4},2000);
 assert.ok(game.conflicts.includes(0));
 assert.ok(game.conflicts.includes(2));
 assert.equal(game.solved,false);
 for(let cell=0;cell<81;cell++) if(!puzzle.board[cell]) game=applyAction(game,{type:'digit',cell,digit:puzzle.solution[cell]},3000);
 assert.equal(game.solved,true);
 assert.deepEqual(game.conflicts,[]);
 assert.equal(game.elapsedMs,2000);
 assert.equal(applyAction(game,{type:'tick'},9000).elapsedMs,2000);
});
test('计时仅累计前台时长，重复暂停恢复不重复累计，暂停拒绝输入', () => {
 let game=createGame(puzzle,1000);
 game=applyAction(game,{type:'pause'},3000);
 assert.equal(game.elapsedMs,2000);
 assert.equal(game.paused,true);
 assert.equal(applyAction(game,{type:'digit',cell:2,digit:5},4000).board[2],0);
 game=applyAction(game,{type:'pause'},5000);
 game=applyAction(game,{type:'resume'},10000);
 game=applyAction(game,{type:'resume'},11000);
 game=applyAction(game,{type:'tick'},13000);
 assert.equal(game.elapsedMs,5000);
 game=applyAction(game,{type:'tick'},12000);
 assert.equal(game.elapsedMs,5000);
});
test('JSON 存档恢复完整笔记和撤销，离线时间不计入，保持暂停', () => {
 let game=applyAction(createGame(puzzle,1000),{type:'note',cell:2,digit:5},2000);
 game=applyAction(game,{type:'digit',cell:2,digit:5},2500);
 const raw=JSON.parse(JSON.stringify(game));
 const restored=restoreGame(raw,puzzles,900000);
 assert.equal(restored.elapsedMs,1500);
 assert.equal(restored.paused,true);
 const resumed=applyAction(restored,{type:'resume'},900000);
 const undone=applyAction(resumed,{type:'undo'},901000);
 assert.deepEqual(undone.notes[2],[5]);
 assert.equal(undone.board[2],0);
 assert.equal(undone.elapsedMs,2500);
 assert.equal(raw.paused,false);
});
test('损坏存档、篡改题目、非法笔记和撤销记录均被拒绝，派生字段重算', () => {
 const game=createGame(puzzle,1000);
 for(const mutate of [g=>g.version=2,g=>g.puzzleId='missing',g=>g.board[0]=1,g=>g.givens[0]=1,g=>g.board[2]=10,g=>g.notes[2]=[1,1],g=>g.notes[0]=[4],g=>g.elapsedMs=Infinity,g=>g.startedAt=-1,g=>g.history=[{board:[],notes:[]}],g=>g.history=[{board:puzzle.solution,notes:[]}],g=>g.paused='yes']) {
  const raw=structuredClone(game); mutate(raw);
  assert.equal(restoreGame(raw,puzzles,2000),null);
 }
 assert.equal(restoreGame(null,puzzles,2000),null);
 const fakeSolved={...game,solved:true,conflicts:[2]};
 const restored=restoreGame(fakeSolved,puzzles,2000);
 assert.equal(restored.solved,false);
 assert.deepEqual(restored.conflicts,[]);
});
test('非法操作不能污染棋盘；错误填满不算完成；撤销恢复先前冲突', () => {
 let game=createGame(puzzle,0);
 for(const action of [{type:'digit',cell:-1,digit:4},{type:'digit',cell:81,digit:4},{type:'digit',cell:2,digit:10},{type:'note',cell:2,digit:0},{type:'note',cell:2,digit:NaN}]) {
  game=applyAction(game,action,0);
  assert.deepEqual(game.board,puzzle.board);
  assert.deepEqual(game.notes[2],[]);
 }
 game=applyAction(game,{type:'digit',cell:2,digit:4},0);
 const fixed=applyAction(game,{type:'digit',cell:2,digit:5},0);
 assert.deepEqual(fixed.conflicts,[]);
 assert.ok(applyAction(fixed,{type:'undo'},0).conflicts.includes(2));
 for(let cell=0;cell<81;cell++) if(!puzzle.board[cell]) game=applyAction(game,{type:'digit',cell,digit:1},0);
 assert.equal(game.board.every(Boolean),true);
 assert.equal(game.solved,false);
});
test('恢复拒绝稀疏数组和超出安全整数范围的时间', () => {
 const sparse=createGame(puzzle,0); delete sparse.givens[0];
 assert.equal(restoreGame(sparse,puzzles,0),null);
 const excessive=createGame(puzzle,0); excessive.elapsedMs=Number.MAX_VALUE;
 assert.equal(restoreGame(excessive,puzzles,0),null);
});
