const fs=require('node:fs');
const path=require('node:path');
const {randomSource,makePuzzle,lesson,label}=require('./content-tools');
const {findPatterns}=require('../miniprogram/core/techniques/locked-xwing');
const random=randomSource(391825);
const definitions=[
 {id:'locked-candidates',title:'区块排除',subtitle:'宫与行列之间的约束',summary:'候选数只能出现在两个区域的交集，便能排除另一区域的其他位置。',rule:'同一宫中的某数字若只在一行或一列出现，可删去该行列宫外的候选数；同一行列中的某数字若只在一宫出现，可删去该宫行列外的候选数。',prerequisites:'候选数、行列与宫、唯一位置'},
 {id:'x-wing',title:'X-Wing',subtitle:'四个角，两种摆法',summary:'在两行或两列中寻找同一个候选数形成的矩形。',rule:'某数字在两行中都恰好只出现于相同两列时，两列中的该数字必被这两行占用，可删除两列其他行的该候选数。行列交换同样成立。',prerequisites:'候选数、区块排除'}
];
const lessons=Object.fromEntries(definitions.map(d=>[d.id,[]]));
for(let attempt=0;attempt<2000&&definitions.some(d=>lessons[d.id].length<5);attempt++) {
 const position=makePuzzle(random);
 for(const definition of definitions) {
  const items=lessons[definition.id];
  if(items.length===5) continue;
  if(items.length>=2&&items.slice(2).some(item=>item.board.filter(Boolean).length===position.board.filter(Boolean).length)) continue;
  const patterns=findPatterns(position,definition.id);
  // Each position is generated independently; alternate orientations for teaching coverage.
  const pattern=patterns.find(p=>definition.id==='locked-candidates'?(items.length%2===0?p.unit[0]===p.unit[1]-1&&p.unit[8]-p.unit[0]===20:p.unit[8]-p.unit[0]!==20):(items.length%2===0?Math.floor(p.cells[0]/9)===Math.floor(p.cells[1]/9):p.cells[0]%9===p.cells[1]%9));
  if(!pattern) continue;
  const item=lesson(definition.id,items.length,position,pattern,definition.rule);
  const locations=pattern.cells.map(label).join('、');
  let why;
  if(definition.id==='locked-candidates') {
   const box=pattern.unit[8]-pattern.unit[0]===20;
   why=box?`本宫的数字 ${pattern.digit} 只可能位于 ${locations}，且这些格子在同一${Math.floor(pattern.cells[0]/9)===Math.floor(pattern.cells[1]/9)?'行':'列'}。本宫必须填入一个 ${pattern.digit}，因此该行列在本宫之外不能再填 ${pattern.digit}。`:`本${pattern.unit[1]-pattern.unit[0]===1?'行':'列'}的数字 ${pattern.digit} 只可能位于 ${locations}，且这些格子都在同一宫。本行列必须填入一个 ${pattern.digit}，因此该宫的其他位置不能再填 ${pattern.digit}。`;
  } else {
   const row=Math.floor(pattern.cells[0]/9)===Math.floor(pattern.cells[1]/9);
   why=`数字 ${pattern.digit} 在这两${row?'行':'列'}中都恰好只有两个候选位置：${locations}。无论选择哪条对角线，两${row?'列':'行'}都会各放入一个 ${pattern.digit}；因此这两${row?'列':'行'}的四角之外可以删除 ${pattern.digit}。`;
  }
  item.steps[1].text=why;
  item.steps[2].text=`${why} 可删除：${pattern.eliminations.map(e=>`${label(e.cell)}的 ${e.digit}`).join('；')}。`;
  items.push(item);
  break;
 }
}
for(const definition of definitions) if(lessons[definition.id].length!==5) throw Error(`Insufficient ${definition.id} positions`);
const courses=definitions.map(definition=>({...definition,lessons:lessons[definition.id]}));
fs.writeFileSync(path.join(__dirname,'../miniprogram/data/locked-xwing.json'),JSON.stringify(courses));
console.log('Generated ten unique-solution positions with raw candidates; proof: [] (no prior deductions).');
