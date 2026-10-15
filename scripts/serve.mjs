import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist/client');
const port=Number(process.env.PORT||4173);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('PORT须为1024–65535之间的整数');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.woff':'font/woff','.txt':'text/plain; charset=utf-8'};
await fs.access(path.join(root,'index.html'));
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');let relative=decodeURIComponent(url.pathname);if(relative==='/')relative='/index.html';
  const target=path.resolve(root,'.'+relative);
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const real=await fs.realpath(target);if(!real.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const data=await fs.readFile(real);res.writeHead(200,{'Content-Type':mime[path.extname(real)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('未找到该资源');}
});
server.on('error',err=>{if(err.code==='EADDRINUSE')console.log(`端口${port}已被占用。当前演示地址：http://localhost:${port}/`);else console.error(err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log(`津门清咽音浪假日已启动：http://localhost:${port}/\n保持此窗口运行，在浏览器中访问。`));
