export const STORAGE_KEY = 'jinmen-herbal-holiday-v1';
export const products = [
  { id: 'coupon5', name: '5元无门槛券', cost: 100, kind: 'coupon', amount: '5元', rule: '无门槛券', art: 'coupon' },
  { id: 'merch', name: '清咽滴丸限定周边', short: '限定周边', cost: 300, kind: 'merch', art: 'fan' },
  { id: 'gift', name: '清咽滴丸限定礼盒', short: '限定礼盒', cost: 600, kind: 'merch', art: 'gift' },
  { id: 'raffle', name: '音乐节门票抽奖资格1次', short: '门票抽奖资格1次', cost: 800, kind: 'raffle', art: 'ticket' },
];
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function weekKey(d = new Date()) { const monday = new Date(d); monday.setDate(d.getDate() - (d.getDay()+6)%7); return dateKey(monday); }
export function initialState() {
  return {
    version: 2, points: 360, week: weekKey(), weeklyEarned: 85, signedOn: '', publishedWeek: '', likesWeek: '', savedWeek: '', interactionOn: '', interactionEarned: 0,
    records: [
      { id: 'seed-pending', type: 'openbox', title: '我的音乐节开箱', status: 'approved', url: 'https://www.xiaohongshu.com/explore/demo', likes: 68, saves: 18, files: [], rewardIssued: true },
      { id: 'seed-approved', type: 'openbox', title: '周末音乐日常', status: 'approved', likes: 26, saves: 7, rewardIssued: true },
      { id: 'seed-rejected', type: 'partner', title: '和搭子一起听现场', status: 'approved', reason: '', friend: '海河晚风', files: [], rewardIssued: true, friendReward: true },
    ],
    rewards: [
      { id: 'seed-coupon10', name: '开箱复购券', amount: '满30减10', rule: '复购券', validityDays: 14, kind: 'coupon', status: 'available', source: '开箱笔记奖励' },
      { id: 'seed-coupon15', name: '护嗓搭子券', amount: '满30减15', rule: '晒单券', validityDays: 14, kind: 'coupon', status: 'available', source: '晒单奖励' },
      { id: 'seed-coupon5', name: '搭子邀请奖励', amount: '5元', rule: '无门槛券', kind: 'coupon', status: 'claimed', source: '双方各得5元券' },
      { id: 'seed-merch', name: '清咽滴丸限定周边', kind: 'merch', art: 'fan', status: 'available', source: '白银开箱官奖励' },
      { id: 'seed-gift', name: '清咽滴丸限定礼盒', kind: 'merch', art: 'gift', status: 'claimed', source: '黄金开箱官奖励' },
    ],
    ledger: [{ id: 'seed-l1', label: '发布笔记', delta: 50 }, { id: 'seed-l2', label: '每日签到', delta: 5 }],
    exchanges: [], member: false,
  };
}
export function loadState(storage) {
  try {
    storage ??= globalThis.localStorage;
    const state = JSON.parse(storage.getItem(STORAGE_KEY));
    if (![1,2].includes(state?.version) || !Array.isArray(state.records) || !Array.isArray(state.rewards) || !Number.isFinite(state.points) || state.points < 0 || !Array.isArray(state.ledger) || !Array.isArray(state.exchanges) || [...state.records,...state.rewards,...state.ledger,...state.exchanges].some(r=>!r || typeof r.id!=='string') || state.records.some(r=>!['openbox','partner','challenge'].includes(r.type))) return initialState();
    return migrateState(state);
  } catch { return initialState(); }
}
export function migrateState(state) {
  let next=normalizeWeek({...initialState(),...state,weeklyEarned:Math.max(0,Math.min(500,Number(state.weeklyEarned)||0))});
  if(next.version===2)return next;
  next={...next,records:next.records.map(r=>({...r}))};
  for(const record of next.records){
    if(['pending','rejected'].includes(record.status)){
      next={...next,records:next.records.map(r=>r.id===record.id?{...r,status:'pending'}:r)};
      next=reviewRecord(next,record.id,true).state;
    }
  }
  return {...next,version:2};
}
export function saveState(state,storage) {
  try{storage ??= globalThis.localStorage;storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}
}
export function normalizeWeek(state) {
  return state.week === weekKey() ? state : { ...state, week: weekKey(), weeklyEarned: 0 };
}
function addPoints(state, amount, label, id) {
  state = normalizeWeek(state);
  const actual = Math.max(0, Math.min(amount, 500 - state.weeklyEarned));
  if (!actual || state.ledger.some(entry=>entry.id===id)) return { state, earned: 0 };
  return { earned: actual, state: { ...state, points: state.points + actual, weeklyEarned: state.weeklyEarned + actual, ledger: [{ id, label, delta: actual }, ...state.ledger] } };
}
export function signIn(state) {
  if (state.signedOn === dateKey()) return { state, message: '今天已经签到过了' };
  const result = addPoints(state, 5, '每日签到', `sign-${dateKey()}`);
  return { state: { ...result.state, signedOn: dateKey() }, message: result.earned ? `签到成功，+${result.earned}积分` : '签到成功，本周积分已达上限' };
}
export function interact(state) {
  const old = state.interactionOn === dateKey() ? state.interactionEarned : 0;
  if (old >= 10) return { state, message: '今日互动积分已达10分上限' };
  const result = addPoints(state, Math.min(2, 10 - old), '点赞开箱精选', `interaction-${dateKey()}-${old}`);
  return { state: { ...result.state, interactionOn: dateKey(), interactionEarned: old + result.earned }, message: result.earned ? `互动成功，+${result.earned}积分` : '本周积分已达500分上限' };
}
export function claimMetric(state, metric) {
  const field = metric === 'likes' ? 'likesWeek' : 'savedWeek';
  const threshold = metric === 'likes' ? 100 : 50;
  if (state[field] === weekKey()) return { state, message: '本周已领取该任务积分' };
  if (!state.records.some(r => r.type === 'openbox' && r.status === 'approved' && (r[metric] || 0) >= threshold)) return { state, message: '暂无已审核通过且达到门槛的笔记' };
  const result = addPoints(state, 30, metric === 'likes' ? '点赞达到100' : '收藏达到50', `${field}-${weekKey()}`);
  return { state: { ...result.state, [field]: weekKey() }, message: result.earned ? `任务完成，+${result.earned}积分` : '本周积分已达上限' };
}
export function reviewRecord(state, id, approved, stats = {}) {
  const record = state.records.find(r => r.id === id);
  if (!record || record.status !== 'pending') return { state, message: '这条记录已处理，请勿重复审核' };
  let updated = { ...record, status: approved ? 'approved' : 'rejected', reason: approved ? '' : '购买或作品证明不清晰，请补充截图', likes: Math.max(0, Math.floor(Number(stats.likes) || record.likes || 0)), saves: Math.max(0, Math.floor(Number(stats.saves) || record.saves || 0)) };
  let next = { ...state, records: state.records.map(r => r.id === id ? updated : r) };
  if (!approved) return { state: next, message: '已模拟未通过，可补充材料重新提交' };
  if (record.rewardIssued) return { state: next, message: '审核通过，原奖励已发放' };
  const newRewards = [];
  const reward = (suffix, data) => {const rewardId=`${id}-${suffix}`;if(!next.rewards.some(r=>r.id===rewardId))newRewards.push({ id: rewardId, status: 'available', ...data });};
  if (record.type === 'openbox') {
    reward('bronze', { name: '开箱复购券', amount: '满30减10', rule: '复购券', validityDays: 14, kind: 'coupon', source: '发布1篇开箱笔记' });
    if (updated.likes > 50) reward('silver', { name: '清咽滴丸限定周边', kind: 'merch', art: 'fan', source: '白银 · 点赞>50' });
    if (updated.likes > 200) reward('gold', { name: '清咽滴丸限定礼盒', kind: 'merch', art: 'gift', source: '黄金 · 点赞>200' });
    if (state.publishedWeek !== weekKey()) {
      next = addPoints(next, 50, '发布开箱笔记', `${id}-points`).state;
      next.publishedWeek = weekKey();
    }
  } else if (record.type === 'partner') {
    reward('partner-coupon', { name: '护嗓搭子券', amount: '满30减15', rule: '晒单券', validityDays: 14, kind: 'coupon', source: '晒单审核通过' });
    if (record.friend) reward('invite-coupon', { name: '搭子邀请奖励', amount: '5元', rule: '无门槛券', kind: 'coupon', source: `邀请${record.friend} · 双方各得5元券` });
    updated.friendReward = !!record.friend;
  } else if (record.type === 'challenge') {
    next.member = true;
    reward('member', { name: '达仁堂乐迷会员资格', kind: 'membership', status: 'claimed', source: '专属折扣 · 新品试用优先权' });
  }
  updated.rewardIssued = true;
  return { state: { ...next, records: next.records.map(r => r.id === id ? updated : r), rewards: [...newRewards, ...next.rewards] }, message: '提交成功，已通过，奖励已到账' };
}
export function redeem(state, productId, uid = `exchange-${Date.now()}`) {
  if (state.exchanges.some(e => e.id === uid)) return { state, message: '这笔兑换已经完成' };
  const product = products.find(p => p.id === productId);
  if (!product || state.points < product.cost) return { state, message: '积分不足，先做任务攒积分吧' };
  const reward = { ...product, id: uid, status: product.kind === 'raffle' ? 'claimed' : 'available', source: `${product.cost}积分兑换` };
  return { state: { ...state, points: state.points - product.cost, rewards: [reward, ...state.rewards], exchanges: [{ id: uid, name: product.name, cost: product.cost }, ...state.exchanges], ledger: [{ id: uid, label: `兑换${product.short || product.name}`, delta: -product.cost }, ...state.ledger] }, message: product.kind === 'raffle' ? '已获得1次抽奖资格，不代表已获得门票' : '兑换成功，奖励已放入我的权益' };
}
export function claimReward(state, id) {
  const reward = state.rewards.find(r => r.id === id);
  if (!reward || reward.status !== 'available') return { state, message: '奖励已领取，请勿重复操作' };
  return { state: { ...state, rewards: state.rewards.map(r => r.id === id ? { ...r, status: 'claimed' } : r) }, message: '奖励已领取，可在领取记录中查看' };
}
export function submitRecord(state, record, editId) {
  if(!record || !['openbox','partner','challenge'].includes(record.type) || typeof record.id!=='string' || !record.id.trim() || !validLink(record.url) || (record.type!=='openbox' && (!Array.isArray(record.files)||!record.files.length)))return {state,message:'请补全有效作品链接和购买证明'};
  const canonical=value=>{try{const u=new URL(value.trim());u.hash='';return u.href.replace(/\/$/,'');}catch{return value;}};
  if(state.records.some(r=>r.id===record.id || (r.id!==editId && r.type===record.type && r.url && canonical(r.url)===canonical(record.url))))return {state,message:'这份作品已提交，请在我的参与记录中查看'};
  const existing = editId && state.records.find(r => r.id === editId && r.status === 'rejected');
  if (editId && !existing) return { state, message: '只有未通过的记录可补充后重新提交' };
  const nextRecord = { ...(existing || {}), ...record, url:record.url.trim(), id: existing?.id || record.id, likes:0,saves:0,status: 'pending', reason: '', rewardIssued: existing?.rewardIssued || false };
  const next={ ...state, records: existing ? state.records.map(r => r.id === existing.id ? nextRecord : r) : [nextRecord, ...state.records] };
  return reviewRecord(next,nextRecord.id,true);
}
export function validLink(value) { if(typeof value!=='string')return false;try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !!url.hostname && url.hostname.includes('.'); } catch { return false; } }
