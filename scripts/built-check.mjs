import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {browserPage} from './cdp.mjs';
import {initialState,STORAGE_KEY} from '../src/model.js';
const p=await browserPage(),ev=p.evaluate,base=process.env.QA_BASE||'http://127.0.0.1:4188/';
const report={base,checks:[],errors:[]};
await p.send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await p.send('Page.navigate',{url:base});await p.wait(400);
for(let i=0;i<100;i++){if(await ev(`!!document.querySelector('.bottom-nav')`))break;await p.wait(100);}
await ev('document.fonts.ready');await ev(`document.fonts.load('16px WenKai','分享现场')`);assert.equal(await ev(`document.fonts.check('16px WenKai','津门清咽')`),true);
const font=await fetch(base+'assets/fonts/JinmenTitle.woff');assert.equal(font.status,200);assert.equal(font.headers.get('content-type'),'font/woff');assert.equal((await font.arrayBuffer()).byteLength,6836);report.checks.push('生产资源可加载，题字WOFF字体6836字节、MIME正确且已加载');
const legacy={...initialState(),version:1,records:[{id:'old-qa',type:'openbox',title:'旧投稿',status:'pending',url:'https://example.com/old-qa',likes:51,saves:8,rewardIssued:false}]};
await ev(`localStorage.setItem(${JSON.stringify(STORAGE_KEY)},${JSON.stringify(JSON.stringify(legacy))});location.reload()`);await p.wait(400);
let s;for(let i=0;i<100;i++){s=await ev(`(()=>{try{return JSON.parse(localStorage.getItem('${STORAGE_KEY}'));}catch{return null;}})()`);if(s?.version===2)break;await p.wait(100);}
assert.equal(s.points,410);assert.equal(s.records[0].status,'approved');assert.equal(s.rewards.filter(r=>r.id.startsWith('old-qa-')).length,2);const snapshot=JSON.stringify(s);
await ev('location.reload()');await p.wait(400);for(let i=0;i<100;i++){if(await ev(`document.readyState==='complete'&&!!document.querySelector('.bottom-nav')`))break;await p.wait(100);}
assert.equal(await ev(`localStorage.getItem('${STORAGE_KEY}')`),snapshot);report.checks.push('生产包读取v1待审数据：转通过、基础券/白银周边到账、发布+50，刷新后不重复迁移');
await ev(`localStorage.removeItem('${STORAGE_KEY}');location.reload()`);await p.wait(400);for(let i=0;i<100;i++){if(await ev(`document.readyState==='complete'&&!!document.querySelector('.bottom-nav')`))break;await p.wait(100);}
await ev(`location.hash='/rights'`);await p.wait(150);await ev(`document.querySelectorAll('.tabs button')[3].click()`);await p.wait(70);await ev(`location.hash='/openbox'`);await p.wait(150);await ev(`(()=>{const e=document.querySelector('input[type=url]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'https://example.com/built-post');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await p.wait(50);await ev(`document.querySelector('input[type=checkbox]').click()`);await p.wait(50);await ev(`document.querySelector('.submission-form .primary').click()`);await p.wait(250);assert.ok(await ev(`document.querySelector('.success-panel').textContent.includes('满30减10')`));report.checks.push('预构建静态演示可完成提交并原位显示成功奖励');
await p.screenshot('qa/after/built-success-390.png');await ev(`document.querySelector('.success-panel .primary').click()`);await p.wait(100);assert.equal(await ev(`document.querySelector('.tabs button[aria-pressed=true]').textContent`),'待领取');report.checks.push('成功后查看奖励回到待领取，先前的领取记录筛选不会隐藏新奖励');
const pagesBase=process.env.PAGES_BASE||'/jinmen/';
const html=await fs.readFile('dist/pages/index.html','utf8');const resources=[...html.matchAll(/(?:src|href)="([^"?]+)"/g)].map(m=>m[1]).filter(url=>url.startsWith(pagesBase+'assets/'));assert.ok(resources.length>=2);for(const url of resources)await fs.access('dist/pages/'+url.slice(pagesBase.length));const cssPath=resources.find(x=>x.endsWith('.css'));const css=await fs.readFile('dist/pages/'+cssPath.slice(pagesBase.length),'utf8');assert.ok(css.includes(pagesBase+'assets/fonts/JinmenTitle.woff'));assert.equal(css.includes("url(/assets/"),false);report.checks.push('Pages子路径'+pagesBase+'的脚本、样式与字体路径正确，资源存在');

await ev(`localStorage.removeItem('${STORAGE_KEY}');location.hash='/home';location.reload()`);await p.wait(400);report.errors=p.errors;assert.deepEqual(p.errors,[]);await fs.writeFile('qa/built-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));p.close();
