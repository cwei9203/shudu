const empty=()=>({revealed:[],passed:[],assisted:[]});
function validProgress(record) {return record && ['revealed','passed','assisted'].every(k=>Array.isArray(record[k])&&record[k].every(id=>typeof id==='string')&&new Set(record[k]).size===record[k].length);}
function updateProgress(record,event,independentIds) {
 const next=JSON.parse(JSON.stringify(record||empty()));
 if(!independentIds.includes(event.id)) return next;
 const add=key=>{if(!next[key].includes(event.id)) next[key].push(event.id);};
 if(event.type==='reveal') add('revealed');
 if(event.type==='submit'&&event.ok) add(next.revealed.includes(event.id)&&!next.passed.includes(event.id)?'assisted':'passed');
 return next;
}
function courseStatus(record,ids) {
 const r=record||empty(),passed=ids.filter(id=>r.passed.includes(id)).length;
 if(passed>=2) return 'passed';
 const available=ids.filter(id=>!r.passed.includes(id)&&!r.revealed.includes(id)).length;
 if(passed+available<2) return 'needs-independent';
 return r.passed.length||r.revealed.length||r.assisted.length?'learning':'new';
}
module.exports={updateProgress,courseStatus,validProgress};
