const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const {courses}=require('../miniprogram/data/lessons');
const course=courses[0];
// Run the real page and storage module; only WeChat's storage/UI boundary is simulated.
function runtime(initial) {
 const values=new Map(initial?[['shudu:v1:progress',initial]]:[]);
 let fail=false;
 const wx={getStorageSync:key=>values.has(key)?structuredClone(values.get(key)):'',setStorageSync(key,value){if(fail)throw new Error('disk full');values.set(key,structuredClone(value));}};
 const storageModule={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../miniprogram/core/storage.js'),'utf8'),{wx,module:storageModule});
 function page(name,query) {
  const filename=path.join(__dirname,`../miniprogram/pages/${name}/${name}.js`);
  const nativeRequire=createRequire(filename);
  let definition;
  vm.runInNewContext(fs.readFileSync(filename,'utf8'),{wx,Page:value=>definition=value,require:id=>id.endsWith('/storage')?storageModule.exports:nativeRequire(id)});
  const instance={...definition,data:structuredClone(definition.data),setData(value){Object.assign(this.data,value);}};
  if(instance.onLoad)instance.onLoad(query);
  if(instance.onShow)instance.onShow();
  return instance;
 }
 return {page,fail(value){fail=value;},saved:()=>values.get('shudu:v1:progress')};
}
test('保存失败不显示提示、不提交内存揭示；恢复后保存先于揭示，重进保持辅助资格',()=>{
 const run=runtime(),lesson=course.lessons.find(item=>item.mode==='independent');
 const page=run.page('training',{course:course.id,id:lesson.id});
 run.fail(true);page.reveal();
 assert.equal(page.data.hint,0);
 assert.equal(page.data.marks.length,0);
 assert.equal(page.records[course.id],undefined);
 assert.ok(page.data.error.includes('保存失败'));
 run.fail(false);page.reveal();
 assert.equal(page.data.hint,1);
 assert.equal(page.data.error,'');
 assert.ok(run.saved().value[course.id].revealed.includes(lesson.id));
 const reopened=run.page('training',{course:course.id,id:lesson.id});
 assert.equal(reopened.data.assisted,true);
 reopened.setData({selected:lesson.pattern.cells,targets:lesson.pattern.eliminations});reopened.submit();
 assert.ok(run.saved().value[course.id].assisted.includes(lesson.id));
 assert.equal(run.saved().value[course.id].passed.length,0);
});
test('讲解仅末步记录已读，引导完成单独存储，课程列表显示完成标签',()=>{
 const run=runtime(),example=course.lessons.find(item=>item.mode==='example'),guided=course.lessons.find(item=>item.mode==='guided');
 const page=run.page('training',{course:course.id,id:example.id});
 page.moveStep({currentTarget:{dataset:{delta:1}}});
 assert.equal(run.saved(),undefined);
 while(page.data.step<example.steps.length-1)page.moveStep({currentTarget:{dataset:{delta:1}}});
 assert.ok(run.saved().value[course.id].studied.includes(example.id));
 const exercise=run.page('training',{course:course.id,id:guided.id});
 exercise.setData({selected:guided.pattern.cells,targets:guided.pattern.eliminations});exercise.submit();
 assert.ok(run.saved().value[course.id].guided.includes(guided.id));
 assert.equal(run.saved().value[course.id].passed.length,0);
 const overview=run.page('course',{id:course.id});
 assert.equal(overview.data.status,'learning');
 assert.equal(overview.data.lessons.find(item=>item.id===example.id).label,'✓ 已读讲解');
 assert.equal(overview.data.lessons.find(item=>item.id===guided.id).label,'✓ 引导完成');
});
test('旧版进度正常读取；损坏的新字段不被覆盖；提交保存恢复后清除错误',()=>{
 const old={version:1,value:{[course.id]:{passed:[],revealed:[],assisted:[]}}};
 const run=runtime(old),lesson=course.lessons.find(item=>item.mode==='independent');
 const page=run.page('training',{course:course.id,id:lesson.id});
 assert.equal(page.data.error,'');
 page.setData({selected:lesson.pattern.cells,targets:lesson.pattern.eliminations});
 run.fail(true);page.submit();
 assert.equal(page.data.done,false);
 assert.equal(run.saved().value[course.id].passed.length,0);
 run.fail(false);page.submit();
 assert.equal(page.data.done,true);
 assert.equal(page.data.error,'');
 const corrupt={version:1,value:{[course.id]:{...old.value[course.id],guided:42}}};
 const broken=runtime(corrupt),blocked=broken.page('training',{course:course.id,id:lesson.id});
 assert.ok(blocked.data.error);
 blocked.reveal();
 assert.equal(blocked.data.hint,0);
 assert.deepEqual(broken.saved(),corrupt);
});
