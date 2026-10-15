import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browserPage} from './cdp.mjs';
const p=await browserPage(),ev=p.evaluate,report={routes:[],poster:[],interactions:[],errors:[],limits:['真实手机软键盘与iOS Safari未实机验证；以缩短视口验证表单可滚动及导航可达。']};
const base=process.env.QA_BASE||'http://127.0.0.1:4173/';
await fs.mkdir('qa/after',{recursive:true});
async function size(width,height=900){await p.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await p.wait(60);}
async function navigate(route){await ev(`location.hash='/${route}'`);await p.wait(120);}
async function click(selector){await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.focus();e.click();})()`);await p.wait(100);}
async function textClick(label,scope='document'){await ev(`(()=>{const b=[...${scope}.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)throw Error('missing button');b.focus();b.click();})()`);await p.wait(100);}
async function input(selector,value){await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await p.wait(50);}
const state=()=>ev(`JSON.parse(localStorage.getItem('jinmen-herbal-holiday-v1'))`);
async function ready(){for(let i=0;i<100;i++){if(await ev(`document.readyState==='complete'&&!!document.querySelector('.bottom-nav')`))return;await p.wait(100);}throw Error('页面加载超时');}
async function reset(){await ev(`localStorage.removeItem('jinmen-herbal-holiday-v1');location.reload()`);await p.wait(250);await ready();}
async function upload(){const doc=await p.send('DOM.getDocument'),n=await p.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'.submission-form input[type=file]'});await p.send('DOM.setFileInputFiles',{nodeId:n.nodeId,files:[`${process.cwd()}/public/assets/herbal-stage.png`]});await p.wait(100);}
await p.send('Page.navigate',{url:base});await p.wait(800);await reset();
for(const width of [320,390,430,768,1024,1440]){
 await size(width);
 for(const route of ['home','openbox','points','challenge','partner','mine','rights']){
  await navigate(route);await ev('window.scrollTo(0,0)');await p.wait(70);
  const metrics=await ev(`(()=>{const nav=document.querySelector('.bottom-nav');return{viewport:innerWidth,body:document.documentElement.scrollWidth,naturalScroll:getComputedStyle(document.body).overflowY,nav:nav.getBoundingClientRect().toJSON(),font:getComputedStyle(document.body).fontSize,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),smallTargets:[...document.querySelectorAll('button,summary,select,.checkbox-label,.upload-control')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.slice(0,40))};})()`);
  assert.ok(metrics.body<=width,`${route}@${width} overflow ${metrics.body}`);assert.equal(metrics.font,'16px');assert.deepEqual(metrics.broken,[]);assert.deepEqual(metrics.smallTargets,[],`${route}@${width} small target`);
  assert.deepEqual(await ev(`[...document.querySelectorAll('.bottom-nav button span')].map(e=>e.textContent)`),['首页','福利','我的']);
  if(route==='home'){
   const poster=await ev(`(()=>{const im=document.querySelector('.hero-art'),r=im.getBoundingClientRect(),s=getComputedStyle(im),copy=document.querySelector('.hero-copy').getBoundingClientRect(),cta=document.querySelector('.hero-invitation').getBoundingClientRect();const overlaps=a=>Math.min(a.right,r.right)-Math.max(a.left,r.left)>.5&&Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top)>.5;return {viewport:innerWidth,height:r.height,displayWidth:r.width,naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,opacity:s.opacity,mask:s.maskImage,filter:s.filter,blend:s.mixBlendMode,objectFit:s.objectFit,copyOverlaps:overlaps(copy),buttonOverlaps:overlaps(cta)};})()`);
   assert.equal(poster.naturalWidth,853);assert.equal(poster.naturalHeight,800);assert.ok(Math.abs(poster.height/poster.displayWidth-800/853)<.001);assert.equal(poster.opacity,'1');assert.equal(poster.mask,'none');assert.equal(poster.filter,'none');assert.equal(poster.blend,'normal');assert.equal(poster.objectFit,'contain');assert.equal(poster.copyOverlaps,false);assert.equal(poster.buttonOverlaps,false);report.poster.push(poster);
  }
  report.routes.push({route,width,...metrics});await p.screenshot(`qa/after/${route}-${width}.png`);
  await ev(`document.querySelectorAll('details').forEach(d=>d.open=true);window.scrollTo(0,document.body.scrollHeight)`);await p.wait(100);
  assert.ok(await ev('document.documentElement.scrollWidth<=innerWidth'),`expanded ${route}@${width} overflow`);
  assert.ok(await ev(`document.querySelector('.content-footer').getBoundingClientRect().bottom<=innerHeight+2`));
  if(route!=='home')assert.ok(await ev(`document.querySelector('.page-header').getBoundingClientRect().top===0`));
 }
}
await size(390);await navigate('home');await reset();
await click('.home-topics');assert.ok(await ev(`document.querySelector('.toast').textContent.includes('话题已复制')||(document.querySelector('dialog').open&&document.querySelector('dialog textarea')?.value.includes('#清咽滴丸音浪开箱#'))`));if(await ev(`document.querySelector('dialog').open`))await click('dialog .icon-button');report.interactions.push('首页活动话题可复制；剪贴板不可用时显示可选中复制的完整话题');
await textClick('参加开箱征集');assert.equal(await ev('location.hash'),'#/openbox');
await click('.submission-form .primary');assert.match(await ev(`document.querySelector('.form-error').textContent`),/链接/);assert.equal(await ev('document.activeElement.type'),'url');
await input('.submission-form input[type=url]','https://example.com/openbox-qa');await click('.submission-form .primary');assert.match(await ev(`document.querySelector('.form-error').textContent`),/确认/);
await click('.submission-form input[type=checkbox]');await ev(`document.querySelector('.submission-form .primary').click();document.querySelector('.submission-form .primary')?.click()`);await p.wait(300);
let s=await state();assert.equal(s.points,410);assert.equal(s.records[0].status,'approved');assert.equal(s.records[0].likes,0);assert.equal(s.rewards.filter(r=>r.id===s.records[0].id+'-bronze').length,1);assert.ok(await ev(`document.querySelector('.success-panel').textContent.includes('满30减10')`));await p.screenshot('qa/after/submit-success-390.png');
await textClick('查看奖励','document.querySelector(".success-panel")');assert.equal(await ev('location.hash'),'#/rights');await textClick('返回首页','document.querySelector(".page-header")');assert.equal(await ev('location.hash'),'#/home');report.interactions.push('首页→开箱→校验→连击提交→原位成功→查看奖励→返回首页，基础券1份、积分+50、互动量0');
await navigate('openbox');await input('.submission-form input[type=url]','https://example.com/openbox-qa');await click('.submission-form input[type=checkbox]');await click('.submission-form .primary');assert.match(await ev(`document.querySelector('.form-error').textContent`),/已提交/);assert.equal((await state()).points,410);
await ev('location.reload()');await p.wait(250);await ready();assert.equal((await state()).points,410);report.interactions.push('重复链接、连击与刷新不重复发奖加分');
for(const type of ['partner','challenge']){
 await navigate(type);await input('.submission-form input[type=url]',`https://example.com/${type}-qa`);
 await click('.submission-form input[type=checkbox]');await click('.submission-form .primary');assert.match(await ev(`document.querySelector('.form-error').textContent`),/购买证明/);
 if(type==='partner')await input('input[placeholder="填写好友账号"]','乐迷小林');
 await upload();await click('.submission-form .primary');s=await state();const rec=s.records.find(r=>r.url===`https://example.com/${type}-qa`);assert.equal(rec.status,'approved');assert.ok(rec.rewardIssued);const rewards=s.rewards.filter(r=>r.id.startsWith(rec.id+'-'));assert.equal(rewards.length,type==='partner'?2:1);if(type==='challenge')assert.equal(s.member,true);await p.screenshot(`qa/after/${type}-success-390.png`);
}
report.interactions.push('搭子、返场购买证明必填；提交即通过；搭子满30减15及本人5元券，返场会员资格正确到账');
await navigate('points');await click('.signin-panel .pill-button');assert.equal((await state()).points,415);await click('.signin-panel .pill-button');assert.equal((await state()).points,415);await click('.exchange-card .pill-button');assert.equal(await ev(`document.querySelector('dialog').open`),true);await click('dialog .primary');assert.equal((await state()).points,315);report.interactions.push('签到每天一次；兑换100积分，奖励及记录同步');
await navigate('rights');await click('.merch-row .pill-button');await click('dialog .primary');s=await state();assert.equal(s.rewards[0].status,'claimed');report.interactions.push('奖励领取后不重复领取');
await navigate('mine');await click('.small-action');await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await p.wait(100);assert.equal(await ev(`document.querySelector('dialog').open`),false);assert.equal(await ev(`document.activeElement.className`),'small-action');
await click('.small-action');await click('dialog .icon-button');assert.equal(await ev(`document.querySelector('dialog').open`),false);
await navigate('home');await click('summary');assert.equal(await ev(`document.querySelector('details').open`),true);await ev(`document.querySelector('summary').focus()`);await p.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await p.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await p.wait(100);assert.equal(await ev(`document.querySelector('details').open`),false);report.interactions.push('弹窗Escape与关闭按钮可用，焦点恢复；折叠支持Enter键');
await navigate('openbox');await navigate('partner');await ev('history.back()');await p.wait(150);assert.equal(await ev('location.hash'),'#/openbox');report.interactions.push('深链接及浏览器后退路由同步');
await size(390,460);await ev(`document.querySelector('input[type=url]').focus();document.querySelector('.submission-form .primary').scrollIntoView({block:'center'})`);await p.wait(80);assert.ok(await ev(`(()=>{const a=document.querySelector('.submission-form .primary').getBoundingClientRect();return a.top>=60&&a.bottom<document.querySelector('.bottom-nav').getBoundingClientRect().top;})()`));report.interactions.push('短视口模拟软键盘：表单按钮可滚动到吸顶头部与导航之间');
await size(390);await ev(`localStorage.setItem('jinmen-herbal-holiday-v1','{');location.reload()`);await p.wait(250);await ready();assert.equal((await state()).points,360);report.interactions.push('损坏存储恢复可用初始状态');
await ev(`Storage.prototype.setItem=function(){throw new DOMException('Blocked','QuotaExceededError')};location.hash='/openbox'`);await p.wait(150);await input('.submission-form input[type=url]','https://example.com/no-storage');await click('.submission-form input[type=checkbox]');await click('.submission-form .primary');assert.ok(await ev(`document.querySelector('.success-panel').textContent.includes('浏览器无法保存')`));assert.ok(await ev(`!!document.querySelector('.storage-notice')`));report.interactions.push('存储拒绝写入时内存提交可用，成功区和页顶明确提示刷新可能丢失');
await ev('location.reload()');await p.wait(250);await ready();await reset();
await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await ev(`getComputedStyle(document.querySelector('.primary')).transitionDuration`),'0s');report.interactions.push('减少动态偏好禁用动画与过渡');
await p.send('Emulation.setEmulatedMedia',{features:[]});await navigate('home');await size(1440,1000);await p.screenshot('qa/after/home-final-1440.png');await size(390);await p.screenshot('qa/after/home-final-390.png');
report.errors=p.errors;assert.deepEqual(p.errors,[]);await fs.writeFile('qa/browser-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({responsiveRoutes:report.routes.length,interactions:report.interactions,errors:report.errors,limits:report.limits},null,2));p.close();
