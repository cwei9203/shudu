const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const file of files(path.join(root,'miniprogram'))) {
 if(file.endsWith('.json')) JSON.parse(fs.readFileSync(file,'utf8'));
 if(file.endsWith('.js')) execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
}
const config=require('../miniprogram/app.json');
for(const page of config.pages) for(const ext of ['js','json','wxml','wxss']) if(!fs.existsSync(path.join(root,'miniprogram',`${page}.${ext}`))) throw new Error(`Missing ${page}.${ext}`);
execFileSync(process.execPath,['--test','tests/content.test.js'],{cwd:root,stdio:'inherit'});
console.log('All JavaScript, JSON, page entries and content checks passed. Native template compilation is verified separately in WeChat DevTools.');
