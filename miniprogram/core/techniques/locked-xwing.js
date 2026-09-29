const {units} = require('../sudoku');
function findPatterns(position, technique) {
  const found=[];
  const has=(cell,digit)=>!position.board[cell]&&position.candidates[cell].includes(digit);
  if(technique==='locked-candidates') {
    for(let digit=1;digit<=9;digit++) for(let source=0;source<27;source++) {
      const cells=units[source].filter(cell=>has(cell,digit));
      if(cells.length<2||cells.length>3) continue;
      for(let target=0;target<27;target++) {
        if((source<18)===(target<18)||!cells.every(cell=>units[target].includes(cell))) continue;
        const eliminations=units[target].filter(cell=>!units[source].includes(cell)&&has(cell,digit)).map(cell=>({cell,digit}));
        if(eliminations.length) found.push({cells,eliminations,digit,unit:units[source]});
      }
    }
  }
  if(technique==='x-wing') {
    for(let digit=1;digit<=9;digit++) for(const offset of [0,9]) {
      const cover=cell=>offset===0?cell%9:Math.floor(cell/9);
      const pairs=units.slice(offset,offset+9).map(unit=>unit.filter(cell=>has(cell,digit)));
      for(let a=0;a<9;a++) for(let b=a+1;b<9;b++) {
        if(pairs[a].length!==2||pairs[b].length!==2) continue;
        const covers=pairs[a].map(cover);
        if(!pairs[b].every(cell=>covers.includes(cover(cell)))) continue;
        const cells=pairs[a].concat(pairs[b]);
        const eliminations=covers.flatMap(index=>units[(offset===0?9:0)+index]).filter(cell=>!cells.includes(cell)&&has(cell,digit)).map(cell=>({cell,digit}));
        if(eliminations.length) found.push({cells,eliminations,digit,unit:units[offset+a]});
      }
    }
  }
  return found;
}
module.exports={findPatterns};
