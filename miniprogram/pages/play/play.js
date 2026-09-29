const puzzles = require('../../data/puzzles');
const { createGame, applyAction, restoreGame } = require('../../core/game');
const { peers } = require('../../core/sudoku');
const storage = require('../../core/storage');
const timeLabel = ms => `${String(Math.floor(ms / 60000)).padStart(2,'0')}:${String(Math.floor(ms / 1000) % 60).padStart(2,'0')}`;
Page({
 data:{puzzles:puzzles.map(p=>({id:p.id,title:p.title})),game:null,active:-1,marks:[],noteMode:false,digits:[1,2,3,4,5,6,7,8,9],clock:'00:00',error:'',selection:'先选择一个空格',remaining:0,showPicker:true},
 onLoad(){
  const saved=storage.load('game',raw=>restoreGame(raw,puzzles)!==null);
  if(saved.value) this.game=restoreGame(saved.value,puzzles);
  this.setData({error:saved.error,showPicker:!this.game});
  this.render();
 },
 onShow(){
  clearInterval(this.timer);
  this.timer=setInterval(()=>{
   if(!this.game||this.game.paused||this.game.solved) return;
   this.game=applyAction(this.game,{type:'tick'},Date.now());
   this.setData({clock:timeLabel(this.game.elapsedMs)});
   if(Date.now()-(this.lastSaved||0)>=10000) this.persist();
  },1000);
 },
 onHide(){this.suspend();},
 onUnload(){this.suspend();},
 suspend(){
  clearInterval(this.timer);
  if(this.game) {this.game=applyAction(this.game,{type:'pause'},Date.now());this.render();this.persist();}
 },
 persist(){
  if(!this.game) return;
  const result=storage.save('game',this.game);
  this.lastSaved=Date.now();
  this.setData({error:result.error});
 },
 render(){
  if(!this.game) return;
  const active=this.data.active;
  const value=this.game.board[active];
  const marks=active<0?[]:[...new Set(peers(active).concat(value?this.game.board.map((n,i)=>n===value?i:-1).filter(i=>i>=0):[]))];
  this.setData({game:this.game,title:puzzles.find(p=>p.id===this.game.puzzleId).title,clock:timeLabel(this.game.elapsedMs),remaining:this.game.board.filter(n=>!n).length,marks,
   selection:active<0?'先选择一个空格':`第 ${Math.floor(active/9)+1} 行 · 第 ${active%9+1} 列${this.game.givens[active]?' · 题目数字不可修改':this.data.noteMode?' · 笔记模式':' · 填数模式'}`});
 },
 selectCell(event){
  if(!this.game||this.game.paused||this.game.solved) return;
  this.setData({active:event.detail.index});this.render();
 },
 act(action){
  if(!this.game) return;
  this.game=applyAction(this.game,action,Date.now());
  this.render();this.persist();
 },
 inputDigit(event){this.act({type:this.data.noteMode?'note':'digit',cell:this.data.active,digit:Number(event.currentTarget.dataset.digit)});},
 erase(){this.act({type:'erase',cell:this.data.active});},
 undo(){this.act({type:'undo'});},
 toggleNotes(){this.setData({noteMode:!this.data.noteMode});this.render();},
 togglePause(){this.act({type:this.game.paused?'resume':'pause'});},
 togglePicker(){this.setData({showPicker:!this.data.showPicker});},
 choosePuzzle(event){
  const puzzle=puzzles.find(p=>p.id===event.currentTarget.dataset.id);
  if(!puzzle) return;
  const start=()=>{
   this.game=createGame(puzzle,Date.now());
   this.setData({active:-1,noteMode:false,showPicker:false});
   this.render();this.persist();
  };
  if(this.game&&!this.game.solved) wx.showModal({title:'开始新的练习？',content:'当前对局会被新题替换。学习课程进度不受影响。',confirmText:'开始新题',success:result=>{if(result.confirm) start();}});
  else start();
 }
});
