const {solve,candidatesFor}=require('../miniprogram/core/sudoku');
function randomSource(seed) { return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}; }
function shuffle(values,random) {const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function makePuzzle(random) {
 const groups=()=>shuffle([0,1,2],random).flatMap(g=>shuffle([0,1,2],random).map(i=>g*3+i));
 const rows=groups(),cols=groups(),digits=shuffle([1,2,3,4,5,6,7,8,9],random);
 const solution=rows.flatMap(r=>cols.map(c=>digits[(r*3+Math.floor(r/3)+c)%9]));
 const board=solution.slice();
 for(const cell of shuffle(Array.from({length:81},(_,i)=>i),random)) {
  const previous=board[cell];board[cell]=0;if(solve(board,2).length!==1) board[cell]=previous;
 }
 return {board,solution,candidates:candidatesFor(board),proof:[]};
}
const label=i=>`第${Math.floor(i/9)+1}行第${i%9+1}列`;
function lesson(id,index,position,pattern,rule) {
 const mode=index===0?'example':index===1?'guided':'independent';
 return {...position,id:`${id}-${index+1}`,mode,title:index===0?'看懂这一步':index===1?'跟着试一次':`独立练习 ${index-1}`,pattern,steps:[
  {text:rule,cells:[],eliminations:[]},
  {text:`观察 ${pattern.cells.map(label).join('、')}。比较这些格子的候选数与位置关系。`,cells:pattern.cells,eliminations:[]},
  {text:`${rule} 因此可以删除：${pattern.eliminations.map(e=>`${label(e.cell)}的${e.digit}`).join('；')}。`,cells:pattern.cells,eliminations:pattern.eliminations}
 ]};
}
module.exports={randomSource,shuffle,makePuzzle,lesson,label};
