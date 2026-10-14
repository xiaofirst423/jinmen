import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, signIn, interact, reviewRecord, redeem, claimReward, submitRecord, claimMetric, validLink, weekKey} from '../src/model.js';
test('签到每天只增加一次积分，周上限不超500',()=>{
 const base={...initialState(),weeklyEarned:498};const first=signIn(base).state;
 assert.equal(first.points,base.points+2);assert.equal(first.weeklyEarned,500);
 assert.deepEqual(signIn(first).state,first);
});
test('互动每日最多10分，达到上限不再发分',()=>{let s={...initialState(),weeklyEarned:0};for(let i=0;i<9;i++)s=interact(s).state;assert.equal(s.interactionEarned,10);assert.equal(s.points,370);});
test('白银和黄金采用严格大于门槛，审核奖励不能重复',()=>{
 for(const [likes,silver,gold] of [[50,false,false],[51,true,false],[200,true,false],[201,true,true]]){
  const s=initialState();const next=reviewRecord(s,'seed-pending',true,{likes,saves:50}).state;
  assert.equal(next.rewards.some(r=>r.id==='seed-pending-silver'),silver);
  assert.equal(next.rewards.some(r=>r.id==='seed-pending-gold'),gold);
  assert.equal(next.points,410);assert.deepEqual(reviewRecord(next,'seed-pending',true).state,next);
 }
});
test('发布积分每周仅发一次，点赞和收藏任务各领取一次',()=>{
 let s=reviewRecord(initialState(),'seed-pending',true,{likes:201,saves:50}).state;
 s=claimMetric(s,'likes').state;s=claimMetric(s,'saves').state;assert.equal(s.points,470);
 assert.deepEqual(claimMetric(s,'likes').state,s);
 s=submitRecord(s,{id:'second',type:'openbox',title:'第二篇'}).state;
 s=reviewRecord(s,'second',true).state;assert.equal(s.points,470);assert.equal(s.publishedWeek,weekKey());
});
test('未通过可补充后重审，无奖励重复或提前发放',()=>{
 let s=reviewRecord(initialState(),'seed-pending',false).state;assert.equal(s.points,360);
 s=submitRecord(s,{id:'unused',type:'openbox',url:'https://example.com/note'},'seed-pending').state;
 assert.equal(s.records.find(r=>r.id==='seed-pending').status,'pending');
 s=reviewRecord(s,'seed-pending',true).state;assert.equal(s.rewards.filter(r=>r.id==='seed-pending-bronze').length,1);
});
test('搭子通过后得到30-15和本人5元券，好友奖励不进入本人账户',()=>{
 let s=submitRecord(initialState(),{id:'partner-new',type:'partner',friend:'小林'}).state;
 s=reviewRecord(s,'partner-new',true).state;
 const issued=s.rewards.filter(r=>r.id.startsWith('partner-new'));
 assert.equal(issued.length,2);assert.equal(issued[0].amount,'满30减15');assert.equal(issued[1].amount,'5元');
 assert.equal(s.records.find(r=>r.id==='partner-new').friendReward,true);
});
test('积分不足不能兑换，兑换不能重复扣分，800只获得抽奖资格',()=>{
 let s=initialState();assert.deepEqual(redeem(s,'gift').state,s);
 s=redeem(s,'coupon5','x1').state;assert.equal(s.points,260);assert.equal(s.exchanges.length,1);
 assert.deepEqual(redeem(s,'coupon5','x1').state,s);
 const raffle=redeem({...s,points:800},'raffle','raffle1').state;
 assert.equal(raffle.points,0);assert.equal(raffle.rewards[0].kind,'raffle');assert.match(raffle.rewards[0].name,/抽奖资格/);
});
test('已领取奖励不可再次领取，券有效期不扩大到5元券',()=>{
 const s=claimReward(initialState(),'seed-coupon10').state;assert.equal(s.rewards.find(r=>r.id==='seed-coupon10').status,'claimed');assert.deepEqual(claimReward(s,'seed-coupon10').state,s);
 assert.equal(s.rewards.find(r=>r.id==='seed-coupon10').validityDays,14);assert.equal(s.rewards.find(r=>r.id==='seed-coupon5').validityDays,undefined);
});
test('链接拒绝脚本和不完整输入',()=>{assert.equal(validLink('javascript:alert(1)'),false);assert.equal(validLink('abc'),false);assert.equal(validLink('https://www.xiaohongshu.com/explore/demo'),true);});
