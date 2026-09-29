const empty=()=>({revealed:[],passed:[],assisted:[],studied:[],guided:[]});
function validIds(ids) {
 return Array.isArray(ids)&&ids.every(id=>typeof id==='string')&&new Set(ids).size===ids.length;
}
function validProgress(record) {
 return !!record&&['revealed','passed','assisted'].every(key=>validIds(record[key]))&&['studied','guided'].every(key=>record[key]===undefined||validIds(record[key]));
}
function isProgressMap(value) {
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.values(value).every(validProgress);
}
// Optional catalog adds example/guided tracking; independentIds retains the original contract.
function updateProgress(record,event,independentIds,catalog=[]) {
 const next=JSON.parse(JSON.stringify({...empty(),...record}));
 const add=key=>{if(!next[key].includes(event.id)) next[key].push(event.id);};
 if(independentIds.includes(event.id)) {
  if(event.type==='reveal') add('revealed');
  if(event.type==='submit'&&event.ok) add(next.revealed.includes(event.id)&&!next.passed.includes(event.id)?'assisted':'passed');
 } else {
  const lesson=catalog.find(item=>item.id===event.id);
  if(lesson&&lesson.mode==='example'&&event.type==='study') add('studied');
  if(lesson&&lesson.mode==='guided'&&event.type==='submit'&&event.ok) add('guided');
 }
 return next;
}
function courseStatus(record,ids) {
 const r=record||empty(),passed=ids.filter(id=>r.passed.includes(id)).length;
 if(passed>=2) return 'passed';
 const available=ids.filter(id=>!r.passed.includes(id)&&!r.revealed.includes(id)).length;
 if(passed+available<2) return 'needs-independent';
 return ['passed','revealed','assisted','studied','guided'].some(key=>(r[key]||[]).length)?'learning':'new';
}
module.exports={updateProgress,courseStatus,validProgress,isProgressMap};
