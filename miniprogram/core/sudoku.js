const digits = [1,2,3,4,5,6,7,8,9];
const units = [];
for (let i=0;i<9;i++) units.push(Array.from({length:9},(_,j)=>i*9+j));
for (let i=0;i<9;i++) units.push(Array.from({length:9},(_,j)=>j*9+i));
for (let i=0;i<9;i++) units.push(Array.from({length:9},(_,j)=>Math.floor(i/3)*27+i%3*3+Math.floor(j/3)*9+j%3));
const peerLists = Array.from({length:81},(_,i)=> [...new Set(units.filter(u=>u.includes(i)).flat())].filter(j=>j!==i));
const peers = index => peerLists[index] || [];
function validBoard(board) { return Array.isArray(board) && board.length===81 && board.every(n=>Number.isInteger(n)&&n>=0&&n<=9); }
function candidatesFor(board) {
  return board.map((n,i)=>n ? [] : digits.filter(d=>!peers(i).some(j=>board[j]===d)));
}
function solve(input, limit=2) {
  if (!validBoard(input) || units.some(u=> {const ns=u.map(i=>input[i]).filter(Boolean);return new Set(ns).size!==ns.length;})) return [];
  const board=input.slice(), answers=[];
  function search() {
    if(answers.length>=limit) return;
    let best=-1, options=digits;
    for(let i=0;i<81;i++) if(!board[i]) {
      const ns=digits.filter(d=>!peers(i).some(j=>board[j]===d));
      if(!ns.length) return;
      if(best<0 || ns.length<options.length) {best=i;options=ns;if(ns.length===1) break;}
    }
    if(best<0) {answers.push(board.slice());return;}
    for(const n of options) {board[best]=n;search();if(answers.length>=limit) break;}
    board[best]=0;
  }
  search();return answers;
}
module.exports={digits,units,peers,validBoard,candidatesFor,solve};
