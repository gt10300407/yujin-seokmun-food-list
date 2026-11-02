import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

test('등록된 사진 경로는 실제 WebP 파일을 가리킨다', async () => {
  const places = JSON.parse(await readFile('data/places.json','utf8'));
  for (const photo of places.flatMap(place => place.photos)) {
    assert.match(photo,/^photos\/[a-z0-9-]+\.webp$/);
    const bytes = await readFile(photo);
    assert.equal(bytes.toString('ascii',0,4),'RIFF');
    assert.equal(bytes.toString('ascii',8,12),'WEBP');
  }
});

test('로컬 관리자 API는 입력을 검증하고 비공개 파일을 노출하지 않는다', async () => {
  const port = 42691;
  const base = `http://localhost:${port}`;
  const server = spawn(process.execPath,['local/server.mjs'],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
  try {
    let ready = false;
    for (let i=0;i<30;i++) { try { await fetch(base); ready=true; break; } catch { await delay(100); } }
    assert.ok(ready,'서버가 실행되어야 합니다.');
    const places = await (await fetch(`${base}/api/places`)).json();
    assert.equal(places.length,10);
    assert.equal((await fetch(`${base}/.env.local`)).status,404);
    assert.equal((await fetch(`${base}/local/server.mjs`)).status,404);
    assert.equal((await fetch(`${base}/api/places`,{method:'PUT',headers:{'Content-Type':'application/json'},body:'[]'})).status,403);
    assert.equal((await fetch(`${base}/api/publish`,{method:'POST'})).status,403);
    assert.equal((await fetch(`${base}/api/places`,{method:'PUT',headers:{Origin:base,'Content-Type':'application/json'},body:'[{"id":"bad"}]'})).status,400);
    assert.equal((await (await fetch(`${base}/api/places`)).json()).length,10);
  } finally { server.kill(); }
});

test('관리 화면의 공개 버튼은 식당 데이터와 사진만 커밋·푸시한다', async () => {
  const temp = await mkdtemp(join(tmpdir(),'food-admin-'));
  const repo = join(temp,'repo');
  const remote = join(temp,'remote.git');
  const port = 42000 + Math.floor(Math.random() * 10000);
  const base = `http://localhost:${port}`;
  let server;
  const git = (...args) => run('git',args,{cwd:repo});
  try {
    await mkdir(join(repo,'local'),{recursive:true});
    await mkdir(join(repo,'data'));
    await mkdir(join(repo,'photos'));
    await cp('local/server.mjs',join(repo,'local/server.mjs'));
    await writeFile(join(repo,'data/places.json'),'[]\n');
    await run('git',['init','--bare','-q',remote]);
    await git('init','-q','-b','main');
    await git('config','user.name','Test');
    await git('config','user.email','test@example.com');
    await git('add','-A');
    await git('commit','-qm','Initial');
    await git('remote','add','origin',remote);
    await git('push','-q','-u','origin','main');
    server = spawn(process.execPath,[join(repo,'local/server.mjs')],{env:{...process.env,PORT:String(port)},stdio:'ignore'});
    let ready = false;
    for (let i=0;i<30;i++) { try { await fetch(`${base}/api/places`); ready=true; break; } catch { await delay(100); } }
    assert.ok(ready,'관리 서버가 실행되어야 합니다.');
    const photoResponse = await fetch(`${base}/api/photo`,{method:'POST',headers:{Origin:base,'Content-Type':'image/webp'},body:await readFile('photos/stone-jjajang-1.webp')});
    assert.equal(photoResponse.status,201);
    const {path:photo} = await photoResponse.json();
    const place = {id:'new-place',name:'새 맛집',address:'경기 안산시 상록구 테스트로 1',category:'한식',menu:'국수',comment:'맛있어요',photos:[photo]};
    assert.equal((await fetch(`${base}/api/places`,{method:'PUT',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify([place])})).status,200);
    const publish = await fetch(`${base}/api/publish`,{method:'POST',headers:{Origin:base}});
    assert.equal(publish.status,200);
    assert.equal((await publish.json()).changed,true);
    assert.deepEqual(JSON.parse((await run('git',['--git-dir',remote,'show','main:data/places.json'])).stdout),[place]);
    assert.match((await run('git',['--git-dir',remote,'ls-tree','-r','--name-only','main','photos'])).stdout, new RegExp(photo));
    assert.equal((await (await fetch(`${base}/api/publish`,{method:'POST',headers:{Origin:base}})).json()).changed,false);
    await writeFile(join(repo,'local/note.txt'),'unpublished code change');
    await git('add','local/note.txt');
    await git('commit','-qm','Code change');
    assert.equal((await fetch(`${base}/api/publish`,{method:'POST',headers:{Origin:base}})).status,409);
  } finally {
    server?.kill();
    await rm(temp,{recursive:true,force:true});
  }
});
