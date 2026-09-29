Component({
 properties:{board:{type:Array,value:[]},candidates:{type:Array,value:[]},selected:{type:Array,value:[]},targets:{type:Array,value:[]},active:{type:Number,value:-1},conflicts:{type:Array,value:[]},marks:{type:Array,value:[]}},
 data:{cells:[]},
 observers:{'board,candidates,selected,targets,active,conflicts,marks':function(){this.renderCells();}},
 lifetimes:{attached(){this.renderCells();}},
 methods:{
  renderCells(){
   const {board,candidates,selected,targets,active,conflicts,marks}=this.data;
   this.setData({cells:Array.from({length:81},(_,index)=>({index,value:board[index]||'',label:`第${Math.floor(index/9)+1}行第${index%9+1}列`,classes:[index%3===2&&index%9!==8?'box-right':'',Math.floor(index/9)%3===2&&index<72?'box-bottom':'',selected.includes(index)?'selected':'',marks.includes(index)?'marked':'',active===index?'active':'',conflicts.includes(index)?'conflict':''].join(' '),selected:selected.includes(index),conflict:conflicts.includes(index),notes:Array.from({length:9},(_,n)=>({digit:n+1,visible:(candidates[index]||[]).includes(n+1),target:targets.some(e=>e.cell===index&&e.digit===n+1)}))}))});
  },
  tap(event){this.triggerEvent('celltap',{index:Number(event.currentTarget.dataset.index)});}
 }
});
