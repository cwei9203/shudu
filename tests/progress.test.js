const test=require('node:test'), assert=require('node:assert/strict');
const {updateProgress,courseStatus}=require('../miniprogram/core/progress');
test('提示不可逆，两道不同独立题通过，已通过不被后来提示撤销',()=>{
 const ids=['a','b','c'];let r;
 r=updateProgress(r,{type:'reveal',id:'a'},ids);
 r=updateProgress(r,{type:'submit',id:'a',ok:true},ids);
 assert.deepEqual(r.passed,[]);assert.deepEqual(r.assisted,['a']);
 r=updateProgress(r,{type:'submit',id:'b',ok:true},ids);
 r=updateProgress(r,{type:'submit',id:'b',ok:true},ids);
 assert.equal(courseStatus(r,ids),'learning');
 r=updateProgress(r,{type:'submit',id:'c',ok:true},ids);
 r=updateProgress(r,{type:'reveal',id:'b'},ids);
 assert.equal(courseStatus(r,ids),'passed');
});
test('错误不揭示答案，题目不足时显示待独立验证且恢复后保持',()=>{
 const ids=['a','b','c'];let r=updateProgress(undefined,{type:'submit',id:'a',ok:false},ids);
 assert.deepEqual(r.revealed,[]);
 r=updateProgress(r,{type:'reveal',id:'a'},ids);r=updateProgress(r,{type:'reveal',id:'b'},ids);
 assert.equal(courseStatus(JSON.parse(JSON.stringify(r)),ids),'needs-independent');
 r=updateProgress(r,{type:'submit',id:'unknown',ok:true},ids);assert.deepEqual(r.passed,[]);
});
test('旧进度兼容讲解与引导记录，只有已知题目能更新且不计入独立通过',()=>{
 const ids=['a','b','c'],catalog=[{id:'intro',mode:'example'},{id:'guide',mode:'guided'}];
 const old={revealed:[],passed:[],assisted:[]};
 let record=updateProgress(old,{type:'study',id:'intro'},ids,catalog);
 assert.deepEqual(record.studied,['intro']);
 assert.equal(courseStatus(record,ids),'learning');
 record=updateProgress(record,{type:'submit',id:'guide',ok:true},ids,catalog);
 assert.deepEqual(record.guided,['guide']);
 assert.deepEqual(record.passed,[]);
 record=updateProgress(record,{type:'study',id:'intro'},ids,catalog);
 assert.deepEqual(record.studied,['intro']);
 for(const event of [{type:'study',id:'unknown'},{type:'submit',id:'unknown',ok:true},{type:'study',id:'guide'},{type:'submit',id:'intro',ok:true}]) {
  assert.deepEqual(updateProgress(record,event,ids,catalog),record);
 }
 assert.deepEqual(old,{revealed:[],passed:[],assisted:[]});
});
