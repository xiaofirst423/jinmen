import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browserPage} from './cdp.mjs';
import {initialState, STORAGE_KEY} from '../src/model.js';

// Check the redesigned account pages against account state, including empty states.
const p=await browserPage(), ev=p.evaluate;
const base=process.env.QA_BASE||'http://127.0.0.1:4188/';
const output=process.env.INNER_QA_DIR||'qa/inner';
const report={base,checks:[],screenshots:[],errors:[]};
await fs.mkdir(output,{recursive:true});
async function settle(){await p.wait(170);await ev('document.fonts.ready');}
async function route(id){await ev(`location.hash='/${id}'`);await settle();}
async function click(selector){await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.focus();e.click();})()`);await settle();}
async function close(){await click('dialog .icon-button');}
async function filter(type){await ev(`(()=>{const s=document.querySelector('select[aria-label="筛选参与记录"]');s.value=${JSON.stringify(type)};s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await settle();}
async function seed(state){await ev(`localStorage.setItem(${JSON.stringify(STORAGE_KEY)},${JSON.stringify(JSON.stringify(state))});location.reload()`);await p.wait(350);}
const state=()=>ev(`JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}))`);
try{
 await p.send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
 await p.send('Page.navigate',{url:base+'?v=inner#/points'});await p.wait(600);await seed(initialState());
 await click('.pass-heading button');assert.equal(await ev(`document.querySelector('#dialog-title').textContent`),'积分明细');assert.equal(await ev(`document.querySelectorAll('dialog .ledger-row').length`),2);await close();
 assert.equal(await ev(`document.activeElement===document.querySelector('.pass-heading button')`),true);
 await click('.exchange-panel .text-link');assert.match(await ev(`document.querySelector('dialog').textContent`),/还没有兑换记录/);await close();
 report.checks.push('积分明细、空兑换记录可打开关闭，关闭后焦点恢复原入口');
 await click('.task-row:nth-child(2) .task-action');assert.match(await ev(`document.querySelector('dialog').textContent`),/当前最高：68/);await click('dialog .primary');assert.equal(await ev('location.hash'),'#/mine');
 await filter('openbox');assert.equal(await ev(`document.querySelectorAll('.record-row').length`),2);
 await filter('partner');assert.equal(await ev(`document.querySelectorAll('.record-row').length`),1);
 await filter('challenge');assert.match(await ev(`document.querySelector('.empty-state').textContent`),/还没有/);
 await filter('all');assert.equal(await ev(`document.querySelectorAll('.record-row').length`),3);
 report.checks.push('任务查看进度→我的投稿可达，三种分类和空分类筛选正确');
 await click('.profile-points');assert.equal(await ev('location.hash'),'#/points');
 const original=await state();await click('.signin-panel .pill-button');
 assert.equal((await state()).points,original.points+5);assert.equal((await state()).weeklyEarned,original.weeklyEarned+5);
 assert.equal(await ev(`document.querySelector('.weekly-progress progress').value`),original.weeklyEarned+5);assert.equal(await ev(`document.querySelector('.signin-panel .pill-button').disabled`),true);
 await click('.signin-panel .pill-button');assert.equal((await state()).points,original.points+5);
 await click('.exchange-card .pill-button');await click('dialog .text-button');assert.equal((await state()).points,original.points+5);
 await click('.exchange-card .pill-button');await click('dialog .primary');
 const exchanged=await state();assert.equal(exchanged.points,original.points+5-100);assert.equal(exchanged.exchanges.length,1);
 assert.equal(await ev(`document.querySelector('.balance').textContent`),String(exchanged.points));
 assert.equal(await ev(`document.querySelector('.exchange-card:nth-child(2) .pill-button').disabled`),true);
 await click('.exchange-panel .text-link');assert.match(await ev(`document.querySelector('dialog').textContent`),/5元无门槛券/);assert.match(await ev(`document.querySelector('dialog').textContent`),/-100积分/);await close();
 await route('mine');assert.deepEqual(await ev(`[...document.querySelectorAll('.member-stats strong')].map(n=>Number(n.textContent))`),[exchanged.points,3,4]);
 await click('.reward-pocket');assert.equal(await ev('location.hash'),'#/rights');await click('.merch-row .pill-button');await click('dialog .primary');
 await route('mine');assert.equal(await ev(`Number(document.querySelector('.member-stats>button:last-child strong').textContent)`),3);
 await ev('location.reload()');await p.wait(350);assert.equal((await state()).points,exchanged.points);
 report.checks.push('签到只加一次且周进度同步；兑换取消不扣分、确认扣100分，明细/不足积分状态/我的三统计同步，领取后奖励数减1，刷新保持');
 await seed({...initialState(),points:0,records:[],rewards:[],exchanges:[],ledger:[]});
 assert.deepEqual(await ev(`[...document.querySelectorAll('.member-stats strong')].map(n=>Number(n.textContent))`),[0,0,0]);
 assert.match(await ev(`document.querySelector('.reward-pocket').textContent`),/收集第一份/);
 await click('.empty-state .primary');assert.equal(await ev('location.hash'),'#/openbox');
 await route('points');assert.equal(await ev(`[...document.querySelectorAll('.exchange-card .pill-button')].every(b=>b.disabled)`),true);
 await click('.pass-heading button');assert.match(await ev(`document.querySelector('dialog').textContent`),/暂无积分记录/);await close();
 report.checks.push('零积分、零奖励、零作品及空明细状态清晰，空记录仍能前往投稿，兑换均禁用');
 await seed({...initialState(),rewards:initialState().rewards.map(r=>({...r,status:'claimed'}))});
 await route('mine');assert.match(await ev(`document.querySelector('.reward-pocket').textContent`),/好礼已收好/);
 await click('.reward-pocket');assert.equal(await ev(`document.querySelector('.tabs button[aria-pressed=true]').textContent`),'领取记录');
 report.checks.push('奖励全部领取后显示已收好，奖励卡直达领取记录');
 await seed({...initialState(),records:[{...initialState().records[0],title:'一段非常长的音乐节体验与天津海河晚风现场记录'.repeat(3)}]});
 await route('mine');assert.equal(await ev('document.documentElement.scrollWidth<=innerWidth'),true);
 await seed(initialState());
 await route('mine');assert.equal(await ev(`new Set([...document.querySelectorAll('.record-photo')].map(i=>i.currentSrc)).size`),3,'Sample records use three different illustrative covers');
 for(const width of [320,390,430,768,1024,1440]){
  const height=width<800?900:1000;
  await p.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
  for(const id of ['points','mine']){
   await route(id);await ev(`window.scrollTo({top:0,behavior:'instant'})`);await p.wait(80);
   const metric=await ev(`({overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)})`);
   assert.equal(metric.overflow,false);assert.deepEqual(metric.broken,[]);
   if(id==='points')assert.deepEqual(await ev(`[...document.querySelectorAll('.task-action')].filter(b=>{const r=document.createRange();r.selectNodeContents(b);return r.getBoundingClientRect().height>30;}).map(b=>b.textContent)`),[],'Task button labels must remain on one line');
   for(const position of ['top','lower']){
    if(position==='lower'){await ev(`document.querySelector(${JSON.stringify(id==='points'?'.mission-panel':'.participation-panel')}).scrollIntoView({block:'start',behavior:'instant'})`);await p.wait(80);}
    const file=`${output}/after-${id}-${width}-${position}.png`;await p.screenshot(file);report.screenshots.push(file);
   }
  }
 }
 report.checks.push('两页六种宽度的首屏和下方卡片已保存；长标题无溢出、图片均正常加载');
 await route('home');await ev('window.scrollTo({top:0,behavior:"instant"})');
 report.errors=p.errors;assert.deepEqual(p.errors,[]);
 await fs.writeFile(`${output}/check.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{p.close();}
