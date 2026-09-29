const {courses}=require('../../data/lessons');
const {courseStatus,isProgressMap}=require('../../core/progress');
const storage=require('../../core/storage');
const statusText={new:'开始学习',learning:'继续学习',passed:'已通过', 'needs-independent':'待独立验证'};
Page({data:{courses:[],completed:0,error:''},onShow(){const loaded=storage.load('progress',isProgressMap);const records=loaded.value||{};const list=courses.map((c,i)=>{const status=courseStatus(records[c.id],c.lessons.filter(l=>l.mode==='independent').map(l=>l.id));return {id:c.id,title:c.title,subtitle:c.subtitle,number:String(i+1).padStart(2,'0'),status,statusText:statusText[status]};});this.setData({courses:list,completed:list.filter(c=>c.status==='passed').length,error:loaded.error});},openCourse(e){wx.navigateTo({url:`/pages/course/course?id=${e.currentTarget.dataset.id}`});}});
