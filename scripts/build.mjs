import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

await rm('dist',{recursive:true,force:true});
await mkdir('dist/data',{recursive:true});
for (const file of ['index.html','style.css','app.js','favicon.svg']) await cp(file,`dist/${file}`);
await cp('data/places.json','dist/data/places.json');
await cp('photos','dist/photos',{recursive:true,force:true});
await writeFile('dist/.nojekyll','');
console.log('dist/ 생성 완료: 공개 사이트 파일만 포함했습니다.');
