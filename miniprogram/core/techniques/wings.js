const {peers} = require('../sudoku');
function findPatterns(position,technique) {
  if(technique!=='xy-wing'&&technique!=='xyz-wing') return [];
  const {board,candidates}=position, xyz=technique==='xyz-wing', found=[];
  for(let pivot=0;pivot<81;pivot++) {
    const ns=candidates[pivot];
    if(board[pivot]||ns.length!==(xyz?3:2)) continue;
    const wings=peers(pivot).filter(i=>!board[i]&&candidates[i].length===2);
    for(let a=0;a<wings.length;a++) for(let b=a+1;b<wings.length;b++) {
      const left=wings[a],right=wings[b],ln=candidates[left],rn=candidates[right];
      const shared=ln.filter(d=>rn.includes(d));
      if(shared.length!==1) continue;
      const digit=shared[0],x=ln.find(d=>d!==digit),y=rn.find(d=>d!==digit);
      if(x===y||!ns.includes(x)||!ns.includes(y)||ns.includes(digit)!==xyz) continue;
      const cells=[pivot,left,right];
      const eliminations=peers(left).filter(i=>!board[i]&&!cells.includes(i)&&peers(right).includes(i)&&(!xyz||peers(pivot).includes(i))&&candidates[i].includes(digit)).map(cell=>({cell,digit}));
      if(eliminations.length) found.push({cells,eliminations,pivot,digit});
    }
  }
  return found;
}
module.exports={findPatterns};
