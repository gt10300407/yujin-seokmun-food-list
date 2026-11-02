import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { readFile } from 'node:fs/promises';

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
    assert.equal((await fetch(`${base}/api/places`,{method:'PUT',headers:{Origin:base,'Content-Type':'application/json'},body:'[{"id":"bad"}]'})).status,400);
    assert.equal((await (await fetch(`${base}/api/places`)).json()).length,10);
  } finally { server.kill(); }
});
