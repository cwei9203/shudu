const blocked = new Set();
const prefix='shudu:v1:';
function load(key,validate) {
 try {
  const raw=wx.getStorageSync(prefix+key);
  if(raw===''||raw===undefined) return {value:null,error:''};
  if(!raw||raw.version!==1||!validate(raw.value)) {blocked.add(key);return {value:null,error:'存档无法读取，原数据已保留。当前操作不会覆盖它。'};}
  return {value:raw.value,error:''};
 } catch(error) {blocked.add(key);return {value:null,error:'读取存档失败，原数据已保留。'};}
}
function save(key,value) {
 if(blocked.has(key)) return {ok:false,error:'存档异常，当前进度未保存；原数据已保留。'};
 try {wx.setStorageSync(prefix+key,{version:1,value});return {ok:true,error:''};}
 catch(error) {return {ok:false,error:'保存失败，请检查设备空间。当前进度仍在内存中。'};}
}
module.exports={load,save};
