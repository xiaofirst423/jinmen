import fs from 'node:fs/promises';
export async function browserPage() {
  const list=await (await fetch('http://127.0.0.1:9227/json')).json();
  const target=list.find(t=>t.type==='page');
  const socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let count=0;const pending=new Map();const errors=[];
  socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.error?p.reject(new Error(data.error.message)):p.resolve(data.result);}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);else if(data.method==='Log.entryAdded'&&data.params.entry.level==='error')errors.push(data.params.entry);};
  function send(method,params={}){const id=++count;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});}
  await send('Runtime.enable');await send('Page.enable');await send('Log.enable');
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value;};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  async function screenshot(file,clip){const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,...(clip?{clip}: {})});await fs.writeFile(file,Buffer.from(data,'base64'));}
  return {send,evaluate,wait,screenshot,errors,close:()=>socket.close()};
}
