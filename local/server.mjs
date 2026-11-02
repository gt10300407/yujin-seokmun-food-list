import { createServer } from 'node:http';
import { readFile, writeFile, rename, mkdir, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

const port = Number(process.env.PORT || 4173);
const dataFile = new URL('../data/places.json', import.meta.url);
const photoDir = new URL('../photos/', import.meta.url);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp'};
const allowed = new Set(['/','/index.html','/app.js','/style.css','/data/places.json','/admin','/local/admin.html','/local/admin.js','/local/admin.css']);

function send(res, status, body, type = 'application/json; charset=utf-8') { res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(body); }
async function body(req, limit) { let size=0; const chunks=[]; for await (const chunk of req) {size+=chunk.length;if(size>limit) throw new Error('파일이 너무 큽니다.');chunks.push(chunk);} return Buffer.concat(chunks); }
function validPlaces(data) {
  return Array.isArray(data) && data.length <= 100 && new Set(data.map(p=>p.id)).size === data.length && data.every(p =>
    /^[a-z0-9-]{1,80}$/.test(p.id) &&
    ['name','address','category','menu','comment'].every((key) => typeof p[key] === 'string') &&
    p.name.trim().length > 0 && p.name.length <= 70 && p.address.trim().length > 0 && p.address.length <= 160 &&
    p.category.trim().length > 0 && p.category.length <= 30 && p.menu.length <= 100 && p.comment.length <= 240 &&
    Array.isArray(p.photos) && p.photos.length <= 30 && p.photos.every(n => /^photos\/[a-z0-9-]+\.webp$/.test(n))
  );
}
function localRequest(req) {
  const host = req.headers.host || '';
  if (!/^((localhost|127\.0\.0\.1):\d+)$/.test(host)) return false;
  if (req.method === 'GET' || req.method === 'HEAD') return true;
  return req.headers.origin === `http://${host}`;
}

const server = createServer(async (req, res) => {
  if (!localRequest(req)) return send(res,403,JSON.stringify({error:'로컬 브라우저에서만 관리할 수 있어요.'}));
  const path = new URL(req.url || '/', `http://${req.headers.host}`).pathname;
  try {
    if (path === '/api/places' && req.method === 'GET') return send(res,200,await readFile(dataFile),'application/json; charset=utf-8');
    if (path === '/api/places' && req.method === 'PUT') {
      const parsed = JSON.parse((await body(req,1024*1024)).toString());
      if (!validPlaces(parsed)) return send(res,400,JSON.stringify({error:'이름·주소·종류와 사진 데이터를 확인해 주세요.'}));
      const before = JSON.parse(await readFile(dataFile,'utf8'));
      const tmp = new URL(`../data/.places-${randomUUID()}.tmp`,import.meta.url);
      await writeFile(tmp,JSON.stringify(parsed,null,2)+'\n'); await rename(tmp,dataFile);
      const used = new Set(parsed.flatMap(p=>p.photos));
      for (const file of before.flatMap(p=>p.photos)) if (!used.has(file)) await unlink(new URL(`../${file}`,import.meta.url)).catch(error => { if(error.code !== 'ENOENT') throw error; });
      return send(res,200,'{"ok":true}');
    }
    if (path === '/api/photo' && req.method === 'POST') {
      if (req.headers['content-type'] !== 'image/webp') return send(res,415,JSON.stringify({error:'WebP 사진만 저장할 수 있어요.'}));
      const photo = await body(req,3*1024*1024);
      if (photo.toString('ascii',0,4) !== 'RIFF' || photo.toString('ascii',8,12) !== 'WEBP') return send(res,400,JSON.stringify({error:'사진 형식이 올바르지 않아요.'}));
      await mkdir(photoDir,{recursive:true});
      const path = `photos/${randomUUID()}.webp`;
      await writeFile(new URL(`../${path}`,import.meta.url),photo,{flag:'wx'});
      return send(res,201,JSON.stringify({path}));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res,405,JSON.stringify({error:'지원하지 않는 요청입니다.'}));
    const file = path === '/' ? '/index.html' : path === '/admin' ? '/local/admin.html' : path;
    if (!allowed.has(file) && file !== '/assets/food-tour-logo.webp' && !/^\/photos\/[a-z0-9-]+\.webp$/.test(file)) return send(res,404,'Not found','text/plain; charset=utf-8');
    const content = await readFile(new URL(`..${file}`,import.meta.url));
    return send(res,200,req.method === 'HEAD' ? '' : content,types[extname(file)] || 'application/octet-stream');
  } catch (error) {
    const code = error.code === 'ENOENT' ? 404 : error.message === '파일이 너무 큽니다.' ? 413 : 500;
    return send(res,code,JSON.stringify({error:code===500?'저장 중 오류가 발생했어요.':error.message}));
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`사이트: http://localhost:${port}  ·  관리자: http://localhost:${port}/admin`));
