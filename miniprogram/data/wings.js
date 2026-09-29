const courses=[
  {id:'xy-wing',title:'XY-Wing',subtitle:'从枢纽的两种可能出发',summary:'通过两条条件推理，找到两翼共同排除的数字。',rule:'枢纽为 XY，两翼为 XZ、YZ；枢纽看到两翼。至少一翼为 Z，同时看到两翼的其他格可以删 Z。',prerequisites:'理解候选数；两个格子同行、同列或同宫就互相可见；会辨认只有两个候选数的格子。',lessons:require('./xy-wing')},
  {id:'xyz-wing',title:'XYZ-Wing',subtitle:'三个候选，三种情况',summary:'比 XY-Wing 多检查枢纽本身也填 Z 的情况。',rule:'枢纽为 XYZ，两翼为 XZ、YZ；枢纽看到两翼。三个格中至少一个为 Z，同时看到三个格的其他格可以删 Z。',prerequisites:'先理解 XY-Wing；注意删数目标还必须看到枢纽。',lessons:require('./xyz-wing')}
];
module.exports={courses};
