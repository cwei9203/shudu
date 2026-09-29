const {units,validBoard} = require('./sudoku');
const extraFinders = [require('./techniques/locked-xwing').findPatterns,require('./techniques/wings').findPatterns];
function findPatterns(position,technique) {
  if(technique!=='naked-pair') return extraFinders.flatMap(find=>find(position,technique));
  const found=[];
  for(const unit of units) {
    const pairs=unit.filter(i=>!position.board[i]&&position.candidates[i].length===2);
    for(let a=0;a<pairs.length;a++) for(let b=a+1;b<pairs.length;b++) {
      const cells=[pairs[a],pairs[b]], ns=position.candidates[cells[0]];
      if(!ns.every(d=>position.candidates[cells[1]].includes(d))) continue;
      const eliminations=unit.filter(i=>!cells.includes(i)&&!position.board[i]).flatMap(cell=>ns.filter(digit=>position.candidates[cell].includes(digit)).map(digit=>({cell,digit})));
      if(eliminations.length) found.push({cells,eliminations,unit});
    }
  }
  return found;
}
function judgeSubmission(position, technique, cells, eliminations) {
  const fail=(code,message)=>({ok:false,code,message});
  if(!position || !validBoard(position.board) || !Array.isArray(position.candidates) || position.candidates.length!==81 || !position.candidates.every(ns=>Array.isArray(ns)&&ns.every(d=>Number.isInteger(d)&&d>=1&&d<=9)&&new Set(ns).size===ns.length)) return fail('invalid-position','局面数据异常，请返回课程。');
  if(!Array.isArray(cells)||!cells.length||new Set(cells).size!==cells.length||cells.some(i=>!Number.isInteger(i)||i<0||i>80)) return fail('invalid-structure','请完整选择关键格，结构不能重复。');
  const patterns=findPatterns(position,technique).filter(p=>p.cells.length===cells.length&&p.cells.every(i=>cells.includes(i)));
  if(!patterns.length) return fail('invalid-structure','结构不成立，请检查候选数和格子之间的关系。');
  if(!Array.isArray(eliminations)||!eliminations.length) return fail('missing-elimination','请至少选择一个要删除的候选数。');
  if(eliminations.some(e=>!e||!Number.isInteger(e.cell)||!Number.isInteger(e.digit)||e.cell<0||e.cell>80||!position.candidates[e.cell].includes(e.digit)||position.board[e.cell])) return fail('invalid-elimination','提交中包含不存在的候选数。');
  const pattern=patterns.find(p=>eliminations.every(e=>p.eliminations.some(x=>x.cell===e.cell&&x.digit===e.digit)));
  return pattern?{ok:true,code:'correct',message:'推理成立！你找到了有效的结构和删数。',pattern}:fail('unrelated-elimination','有删数不能由所选结构推出，请检查它与关键格的关系。');
}
module.exports={findPatterns,judgeSubmission};
