const fs=require('node:fs');
const path=require('node:path');
const {randomSource,makePuzzle,lesson,label}=require('./content-tools');
const {findPatterns}=require('../miniprogram/core/techniques/wings');
const {candidatesFor,units,peers}=require('../miniprogram/core/sudoku');
const random=randomSource(391502), lessons={'xy-wing':[],'xyz-wing':[]};
const rules={
 'xy-wing':'枢纽为 XY，两翼分别为 XZ、YZ，枢纽看到两翼。无论枢纽填 X 还是 Y，至少一翼为 Z；同时看到两翼的其他格可以删 Z。',
 'xyz-wing':'枢纽为 XYZ，两翼分别为 XZ、YZ，枢纽看到两翼。三个格中至少一个为 Z；同时看到三个格的其他格可以删 Z。'
};
function single(position) {
 const {board,candidates}=position;
 for(let cell=0;cell<81;cell++) if(!board[cell]&&candidates[cell].length===1) return {type:'single',cell,digit:candidates[cell][0]};
 for(const unit of units) for(let digit=1;digit<=9;digit++) {
  const cells=unit.filter(i=>!board[i]&&candidates[i].includes(digit));
  if(cells.length===1) return {type:'single',cell:cells[0],digit};
 }
}
for(let attempt=0;attempt<10000 && Object.values(lessons).some(ls=>ls.length<5);attempt++) {
 const position=makePuzzle(random),originalBoard=position.board.slice(),used=new Set();
 for(let turn=0;turn<60;turn++) {
  for(const technique of Object.keys(lessons)) {
   if(used.has(technique)||lessons[technique].length===5) continue;
   const pattern=findPatterns(position,technique).find(p=>!peers(p.cells[1]).includes(p.cells[2]));
   if(!pattern) continue;
   const copy=JSON.parse(JSON.stringify(position));
   if(copy.proof.length) copy.originalBoard=originalBoard;
   const entry=lesson(technique,lessons[technique].length,copy,pattern,rules[technique]);
   const [pivot,left,right]=pattern.cells,z=pattern.digit;
   entry.steps[1].text=`枢纽 ${label(pivot)} 的候选数为 ${copy.candidates[pivot].join('、')}；两翼 ${label(left)} 为 ${copy.candidates[left].join('、')}，${label(right)} 为 ${copy.candidates[right].join('、')}。枢纽分别看到两翼，两翼的共同候选数为 ${z}。`;
   const x=copy.candidates[left].find(d=>d!==z),y=copy.candidates[right].find(d=>d!==z);
   entry.steps[2].text=`枢纽 ${label(pivot)} 若填 ${x}，${label(left)} 就只能填 ${z}；若填 ${y}，${label(right)} 就只能填 ${z}。${technique==='xyz-wing'?`若枢纽填 ${z}，枢纽本身就是 ${z}。因此目标必须同时看到枢纽和两翼。`:'因此目标只要同时看到两翼，就一定受到一个 '+z+' 的排除。'}可删除：${pattern.eliminations.map(e=>`${label(e.cell)}的${e.digit}`).join('；')}。`;
   lessons[technique].push(entry); used.add(technique);
   console.log(technique,lessons[technique].length,'attempt',attempt,'singles',turn);
   break;
  }
  if(used.size) break;
  const deduction=single(position);if(!deduction) break;
  position.proof.push(deduction);position.board[deduction.cell]=deduction.digit;position.candidates=candidatesFor(position.board);
 }
}
for(const [id,entries] of Object.entries(lessons)) {
 if(entries.length!==5) throw Error(`Insufficient ${id} positions`);
 fs.writeFileSync(path.join(__dirname,'../miniprogram/data',id+'.js'),'module.exports='+JSON.stringify(entries,null,2)+';\n');
}
