const fs=require('node:fs');
const {randomSource,makePuzzle,lesson}=require('./content-tools');
const {findPatterns}=require('../miniprogram/core/techniques');
const random=randomSource(20260929),lessons=[];
const rule='同一行、列或宫中，两个格子都只剩相同的两个候选数。这两个数字必定占据这两个格子，因此同一区域的其他格子不能再填它们。';
while(lessons.length<5) {const p=makePuzzle(random),pattern=findPatterns(p,'naked-pair')[0];if(pattern) lessons.push(lesson('naked-pair',lessons.length,p,pattern,rule));}
const course={id:'naked-pair',title:'显性数对',subtitle:'两个格子，锁定两个数字',summary:'从候选数开始，学会第一次有依据的删数。',rule,prerequisites:'理解候选数；认识行、列、宫。',lessons};
fs.writeFileSync('miniprogram/data/pairs.json',JSON.stringify(course,null,2)+'\n');
fs.writeFileSync('miniprogram/data/puzzles.js','module.exports = '+JSON.stringify([...lessons.map((l,i)=>({id:`puzzle-${i+1}`,title:`静心练习 ${i+1}`,board:l.board,solution:l.solution})),(()=>{const p=makePuzzle(random);return {id:'puzzle-6',title:'静心练习 6',board:p.board,solution:p.solution};})()],null,2)+';\n');
