const {courses}=require('../../data/lessons');
const {judgeSubmission}=require('../../core/techniques');
const {updateProgress,isProgressMap}=require('../../core/progress');
const storage=require('../../core/storage');
Page({
 data:{lesson:null,title:'',selected:[],targets:[],active:-1,phase:'structure',focusLabel:'',step:0,hint:0,marks:[],displayTargets:[],message:'',error:'',digits:[1,2,3,4,5,6,7,8,9],available:[],chosen:[],done:false,assisted:false,example:false},
 onLoad(q){this.course=courses.find(c=>c.id===q.course);this.lesson=this.course&&this.course.lessons.find(l=>l.id===q.id);if(!this.lesson){this.setData({error:'练习不存在，请返回课程。'});return;}const saved=storage.load('progress',isProgressMap);this.records=saved.value||{};const r=this.records[this.course.id];this.setData({lesson:this.lesson,title:this.course.title,example:this.lesson.mode==='example',assisted:this.lesson.mode==='guided'||!!(r&&r.revealed.includes(this.lesson.id)&&!r.passed.includes(this.lesson.id)),error:saved.error});},
 selectCell(e){if(!this.lesson||this.data.example||this.data.done)return;const i=e.detail.index;if(this.lesson.board[i]){this.setData({message:'这是已经填好的数字，请选择空格。'});return;}this.setData({focusLabel:`第 ${Math.floor(i/9)+1} 行第 ${i%9+1} 列 · 候选数：${this.lesson.candidates[i].join('、')}`});if(this.data.phase==='structure'){const selected=this.data.selected.includes(i)?this.data.selected.filter(x=>x!==i):[...this.data.selected,i];this.setData({selected,message:''});}else{this.setData({active:i,available:this.lesson.candidates[i],chosen:this.data.targets.filter(t=>t.cell===i).map(t=>t.digit)});}},
 phase(e){this.setData({phase:e.currentTarget.dataset.phase,message:'',active:-1,available:[],chosen:[]});},
 digit(e){const digit=Number(e.currentTarget.dataset.digit),cell=this.data.active;if(cell<0||!this.lesson.candidates[cell].includes(digit))return;const exists=this.data.targets.some(t=>t.cell===cell&&t.digit===digit);const targets=exists?this.data.targets.filter(t=>t.cell!==cell||t.digit!==digit):[...this.data.targets,{cell,digit}];this.setData({targets,displayTargets:targets,chosen:targets.filter(t=>t.cell===cell).map(t=>t.digit),message:''});},
 persist(event){
  const ids=this.course.lessons.filter(l=>l.mode==='independent').map(l=>l.id);
  const record=updateProgress(this.records[this.course.id],event,ids,this.course.lessons);
  const next={...this.records,[this.course.id]:record};
  const result=storage.save('progress',next);
  if(result.ok)this.records=next;
  this.setData({error:result.error});
  return result.ok;
 },
 submit(){
  const result=judgeSubmission(this.lesson,this.course.id,this.data.selected,this.data.targets);
  if(!result.ok){this.setData({message:result.message});return;}
  if(!this.persist({type:'submit',id:this.lesson.id,ok:true})){
   this.setData({message:'推理正确，但进度未保存；请重试提交。'});return;
  }
  this.setData({done:true,message:this.lesson.mode==='guided'?'✓ 引导练习完成！接下来试试独立题。':this.data.assisted?'✓ 辅助完成。换一道未看提示的题，试着独立完成。':'✓ 独立通过！这一步推理成立。'});
 },
 reveal(){
  if(!this.lesson||!this.persist({type:'reveal',id:this.lesson.id}))return;
  const hint=Math.min(2,this.data.hint+1),record=this.records[this.course.id];
  this.setData({hint,assisted:this.lesson.mode==='guided'||!record.passed.includes(this.lesson.id),marks:this.lesson.steps[hint].cells,displayTargets:hint===2?this.lesson.steps[hint].eliminations:this.data.targets});
 },
 moveStep(e){
  const step=Math.max(0,Math.min(this.lesson.steps.length-1,this.data.step+Number(e.currentTarget.dataset.delta)));
  if(this.data.example&&step===this.lesson.steps.length-1)this.persist({type:'study',id:this.lesson.id});
  this.setData({step,marks:this.lesson.steps[step].cells,displayTargets:this.lesson.steps[step].eliminations});
 },
 reset(){this.setData({selected:[],targets:[],displayTargets:[],active:-1,available:[],chosen:[],done:false,message:'',phase:'structure',marks:[],hint:0,focusLabel:''});},
 back(){wx.navigateBack();}
});
