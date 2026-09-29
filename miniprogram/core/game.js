const { peers, validBoard } = require('./sudoku');
const copy = value => JSON.parse(JSON.stringify(value));
// Public functions return JSON game state; restoreGame returns null for invalid saves.
// Actions: digit/note {cell,digit}, erase {cell}, undo, pause, resume, tick; now is milliseconds.
function createGame(puzzle, now = Date.now()) {
 return {version:1,puzzleId:puzzle.id,givens:puzzle.board.slice(),board:puzzle.board.slice(),notes:Array.from({length:81},()=>[]),history:[],elapsedMs:0,startedAt:now,paused:false,conflicts:[],solved:false};
}
function applyAction(state, action, now = Date.now()) {
 const next = copy(state);
 const {type,cell,digit} = action;
 if(!Number.isFinite(now)||now<0) return next;
 if(!next.paused&&!next.solved) {
  next.elapsedMs+=Math.max(0,now-next.startedAt);
  next.startedAt=Math.max(now,next.startedAt);
 }
 if(type==='pause') {next.paused=true;next.startedAt=null;return next;}
 if(type==='resume') {
  if(next.paused&&!next.solved) {next.paused=false;next.startedAt=now;}
  return next;
 }
 if(next.paused||next.solved) return next;
 if(type==='undo') {
  const previous=next.history.pop();
  if(previous) {next.board=previous.board;next.notes=previous.notes;}
 } else if(['digit','note','erase'].includes(type) && Number.isInteger(cell) && cell>=0 && cell<81 && !next.givens[cell]) {
  if(type!=='erase' && (!Number.isInteger(digit)||digit<1||digit>9)) return next;
  if(type==='note' && next.board[cell]) return next;
  next.history.push({board:next.board.slice(),notes:copy(next.notes)});
  if(type==='note') next.notes[cell]=next.notes[cell].includes(digit)?next.notes[cell].filter(n=>n!==digit):next.notes[cell].concat(digit).sort();
  else {next.board[cell]=type==='erase'?0:digit;next.notes[cell]=[];}
 }
 next.conflicts=next.board.map((n,i)=>n&&peers(i).some(j=>next.board[j]===n)?i:-1).filter(i=>i>=0);
 next.solved=next.board.every(Boolean)&&next.conflicts.length===0;
 if(next.solved) {next.paused=true;next.startedAt=null;}
 return next;
}
function restoreGame(raw, puzzles, now = Date.now()) {
 if(!raw||raw.version!==1||typeof raw.puzzleId!=='string'||typeof raw.paused!=='boolean') return null;
 const puzzle=puzzles.find(p=>p.id===raw.puzzleId);
 if(!puzzle||!validBoard(raw.givens)||Array.from(raw.givens).some((n,i)=>n!==puzzle.board[i])) return null;
 if(!Number.isSafeInteger(raw.elapsedMs)||raw.elapsedMs<0||!Number.isFinite(now)||now<0) return null;
 if(raw.startedAt!==null&&(!Number.isSafeInteger(raw.startedAt)||raw.startedAt<0)) return null;
 if(!raw.paused&&raw.startedAt===null) return null;
 const validSnapshot=snapshot=>snapshot&&validBoard(snapshot.board)&&Array.from(snapshot.board).every((n,i)=>Number.isInteger(n)&&(!puzzle.board[i]||n===puzzle.board[i]))&&Array.isArray(snapshot.notes)&&snapshot.notes.length===81&&Array.from(snapshot.notes).every((ns,i)=>Array.isArray(ns)&&ns.length<=9&&(!snapshot.board[i]||!ns.length)&&new Set(ns).size===ns.length&&Array.from(ns).every(n=>Number.isInteger(n)&&n>=1&&n<=9));
 if(!validSnapshot(raw)||!Array.isArray(raw.history)||!Array.from(raw.history).every(validSnapshot)) return null;
 const state=createGame(puzzle,now);
 state.board=raw.board.slice();state.notes=raw.notes.map(ns=>ns.slice());
 state.history=raw.history.map(h=>({board:h.board.slice(),notes:h.notes.map(ns=>ns.slice())}));
 state.elapsedMs=raw.elapsedMs;
 const restored=applyAction(state,{type:'tick'},now);
 restored.paused=true;restored.startedAt=null;
 return restored;
}
module.exports={createGame,applyAction,restoreGame};
