import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const policyData=JSON.parse(fs.readFileSync('policies.json','utf8'));
const config=JSON.parse(fs.readFileSync('consultation-config.json','utf8'));
const source=fs.readFileSync('app.js','utf8');
const listeners={};
const byId={};
function element(id){
  return byId[id]??=({
    id, innerHTML:'', value:'', hidden:false, disabled:false,
    classList:{add(){},remove(){},toggle(){}},
    setAttribute(){},addEventListener(type,fn){(listeners['#'+id+':'+type]??=[]).push(fn)},
    focus(){},scrollIntoView(){}
  });
}
const root=element('main');
const location={hash:'#home'};
const doc={
  getElementById:element,
  querySelectorAll(){return []},
  querySelector(){return null},
  addEventListener(type,fn){(listeners[type]??=[]).push(fn)}
};
const ss=new Map();
class FakeFormData{
  constructor(form){this.data=form.fields||{}}
  get(name){return this.data[name]??null}
  has(name){return Object.hasOwn(this.data,name)}
}
const context={
  document:doc,location,window:{scrollTo(){},addEventListener(type,fn){(listeners['window:'+type]??=[]).push(fn)}},
  sessionStorage:{getItem:k=>ss.get(k)??null,setItem:(k,v)=>ss.set(k,v),removeItem:k=>ss.delete(k)},
  fetch:async url=>({ok:true,json:async()=>url.includes('consultation-config')?config:policyData}),
  FormData:FakeFormData,
  URLSearchParams,Date,Math,JSON,String,Number,Boolean,Array,Object,Error,Set,clearTimeout(){},setTimeout(){return 1},confirm(){return true}
};
vm.runInNewContext(source,context,{filename:'app.js'});
await new Promise(resolve=>setImmediate(resolve));
await new Promise(resolve=>setImmediate(resolve));
assert.match(root.innerHTML,/demo.member@fusionpolicy.invalid/,'Initial entry gate should be visible');
for(const handler of listeners.submit||[])handler({target:{id:'demo-access-form',fields:{email:'demo.member@fusionpolicy.invalid'}},preventDefault(){}});
assert.match(root.innerHTML,/FIRST PRIORITY BALLOT ROUND/);
assert.match(root.innerHTML,/WEDNESDAY, 2 DECEMBER 2026/);
for(const d of ['Solve the Housing Crisis','Renew Our Democracy','Build up Small Businesses','Rebuild Our Communities']){
 assert.ok(root.innerHTML.includes(d),'Homepage missing area '+d);
}
assert.match(root.innerHTML,/26 OCT 2026/);
assert.match(root.innerHTML,/26 NOV 2026/);
location.hash='#ballots?domain='+encodeURIComponent('Solve the Housing Crisis');
for(const handler of listeners['window:hashchange']||[])handler();
assert.match(root.innerHTML,/Showing: Solve the Housing Crisis/);
assert.match(root.innerHTML,/26 Oct 2026, 12:00 am AEDT/);
assert.match(root.innerHTML,/26 Nov 2026, 11:59 pm AEDT/);
const housing=policyData.policies.find(p=>p.domain==='Solve the Housing Crisis');
location.hash='#ballot/'+housing.id;
for(const handler of listeners['window:hashchange']||[])handler();
assert.match(root.innerHTML,/Ballot starts/);
assert.match(root.innerHTML,/Ballot ends/);
assert.match(root.innerHTML,/FIRST PRIORITY BALLOT ROUND/);
console.log('Smoke test passed: mock email entry, homepage notifications, four priority areas, ballot list and ballot dates.');
