import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browserPage} from './cdp.mjs';
const p=await browserPage();
const report={routes:[],interactions:[],errors:[]};
await fs.mkdir('qa',{recursive:true});
const ev=p.evaluate;
async function size(width,height=844){await p.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<701});}
async function navigate(route){await ev(`location.hash='/${route}'`);await p.wait(100);}
async function click(selector){await ev(`document.querySelector(${JSON.stringify(selector)}).click()`);await p.wait(100);}
async function input(selector,value){await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
const state=()=>ev(`JSON.parse(localStorage.getItem('jinmen-herbal-holiday-v1'))`);
await size(390);await p.send('Page.navigate',{url:'http://127.0.0.1:4173/'});await p.wait(800);
await ev(`localStorage.removeItem('jinmen-herbal-holiday-v1');location.reload()`);await p.wait(700);
const routes=['home','openbox','points','challenge','partner','mine','rights'];
for(const width of [320,390,430]){
 await size(width);
 for(const route of routes){
  await navigate(route);
  const metrics=await ev(`(()=>{const a=document.querySelector('.app-scroll'),nav=document.querySelector('.bottom-nav');return {viewport:innerWidth,body:document.body.scrollWidth,content:a.scrollWidth,client:a.clientWidth,nav:nav.getBoundingClientRect().toJSON(),broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),form:!!document.querySelector('form')};})()`);
  assert.ok(metrics.body<=width,`${route}@${width} body overflow`);assert.ok(metrics.content<=metrics.client,`${route}@${width} content overflow`);assert.equal(metrics.broken.length,0);
  report.routes.push({route,width,...metrics});
  if(width===390||width===320)await p.screenshot(`qa/${route}-${width}.png`);
  await ev(`document.querySelector('.app-scroll').scrollTo({top:100000,behavior:'instant'})`);await p.wait(50);
  const footer=await ev(`(()=>{const r=document.querySelector('.content-footer').getBoundingClientRect(),n=document.querySelector('.bottom-nav').getBoundingClientRect();return {bottom:r.bottom,navTop:n.top};})()`);
  assert.ok(footer.bottom<=footer.navTop+2,`${route}@${width} bottom content cannot clear nav`);
  await ev(`document.querySelector('.app-scroll').scrollTo({top:0,behavior:'instant'})`);
 }
}
await size(390);await navigate('points');await click('.signin-panel .pill-button');assert.equal((await state()).points,365);await click('.signin-panel .pill-button');assert.equal((await state()).points,365);report.interactions.push('签到成功，重复签到不发分');
await click('.exchange-card .pill-button');assert.equal(await ev(`document.querySelector('dialog').open`),true);await click('dialog .primary');assert.equal((await state()).points,265);assert.equal((await state()).exchanges.length,1);report.interactions.push('100积分兑换，余额/记录/奖励同步更新');
await navigate('rights');await click('.coupon-card');await click('dialog .primary');assert.equal((await state()).rewards[0].status,'claimed');await click('.coupon-card');assert.equal(await ev(`document.querySelector('dialog .secondary').disabled`),true);await click('dialog .icon-button');report.interactions.push('奖励领取成功，已领取不再提供领取动作');
await navigate('openbox');await click('.submission-form .primary');assert.ok((await ev(`document.querySelector('.form-error').textContent`)).includes('链接'));
await input('.submission-form input[type=url]','https://www.xiaohongshu.com/explore/demo-2026');await input('.submission-form input:not([type])','现场合唱开箱');await click('.submission-form input[type=checkbox]');await click('.submission-form .primary');await p.wait(500);assert.equal(await ev(`location.hash`),'#/mine');let s=await state();const submission=s.records.find(r=>r.title==='现场合唱开箱');assert.equal(submission.status,'pending');
await click('.content-footer button');await ev(`(()=>{const card=[...document.querySelectorAll('.demo-mobile-sheet .demo-review')].find(e=>e.querySelector('strong').textContent==='现场合唱开箱');[...card.querySelectorAll('button')].find(b=>b.textContent==='黄金通过').click();})()`);await p.wait(100);s=await state();assert.equal(s.records.find(r=>r.id===submission.id).status,'approved');assert.equal(s.points,315);assert.ok(s.rewards.some(r=>r.id===submission.id+'-gold'));await click('.demo-close');report.interactions.push('无效链接报错；投稿待审核→黄金通过→券/周边/礼盒到账');
await navigate('points');await ev(`[...document.querySelectorAll('.task-row')].find(e=>e.textContent.includes('点赞达到100')).querySelector('button').click()`);await p.wait(80);assert.equal((await state()).points,345);await ev(`[...document.querySelectorAll('.task-row')].find(e=>e.textContent.includes('收藏达到50')).querySelector('button').click()`);await p.wait(80);assert.equal((await state()).points,375);report.interactions.push('通过笔记点赞/收藏达标后领取积分，任务显示已领取');
await navigate('partner');await input('.submission-form input[type=url]','https://www.douyin.com/video/demo');await input('.submission-form input[placeholder*="好友账号"]','乐迷小林');await click('.submission-form input[type=checkbox]');await click('.submission-form .primary');assert.ok((await ev(`document.querySelector('.form-error').textContent`)).includes('购买证明'));
const document=await p.send('DOM.getDocument');const fileNode=await p.send('DOM.querySelector',{nodeId:document.root.nodeId,selector:'.submission-form input[type=file]'});await p.send('DOM.setFileInputFiles',{nodeId:fileNode.nodeId,files:[`${process.cwd()}/public/assets/herbal-stage.png`]});await p.wait(100);await click('.submission-form .primary');await p.wait(500);assert.equal(await ev('location.hash'),'#/mine');s=await state();assert.ok(s.records.find(r=>r.type==='partner'&&r.friend==='乐迷小林'&&r.status==='pending'));report.interactions.push('搭子要求购买证明，上传后投稿与邀请保存为待审核');
await navigate('mine');await click('.content-footer button');await ev(`[...document.querySelectorAll('.demo-mobile-sheet button')].find(b=>b.textContent==='展示空参与记录').click()`);await p.wait(100);assert.equal(await ev(`!!document.querySelector('.empty-state')`),true);report.interactions.push('空记录状态有可用参与入口');
await click('.content-footer button');await ev(`[...document.querySelectorAll('.demo-mobile-sheet button')].find(b=>b.textContent==='重置全部演示数据').click()`);await p.wait(100);await click('dialog .primary');assert.equal((await state()).points,360);report.interactions.push('重置恢复初始余额与记录');
await ev(`location.reload()`);await p.wait(500);assert.equal((await state()).points,360);report.interactions.push('刷新后演示数据保留');
await size(1400,1000);await navigate('home');await p.screenshot('qa/desktop-1400.png');assert.ok(await ev(`document.body.scrollWidth<=innerWidth`));
await size(390);await navigate('home');await p.screenshot('qa/home-final-390.png');
report.errors=p.errors;assert.equal(p.errors.length,0,JSON.stringify(p.errors));
await fs.writeFile('qa/browser-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify({responsiveRoutes:report.routes.length,interactions:report.interactions,consoleErrors:report.errors.length},null,2));
p.close();
