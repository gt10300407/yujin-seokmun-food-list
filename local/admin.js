const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let places = [];
let selectedId = null;

function message(text, error = false) { $('#admin-status').textContent = text; $('#admin-status').classList.toggle('error', error); }
function selected() { return places.find((place) => place.id === selectedId); }
function renderList() {
  $('#admin-count').textContent = places.length;
  $('#admin-places').innerHTML = places.map((place) => `<button type="button" data-id="${escape(place.id)}" class="${selectedId === place.id ? 'selected' : ''}"><strong>${escape(place.name || '새 맛집')}</strong><small>${escape(place.category || '종류 미입력')}</small></button>`).join('');
}
function renderPhotos() {
  const place = selected();
  $('#photo-list').innerHTML = place.photos.length ? place.photos.map((photo, index) => `<div class="admin-photo"><img src="/${escape(photo)}" alt="${escape(place.name)} 사진 ${index + 1}"><div class="photo-buttons"><button type="button" data-photo-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''} aria-label="사진 앞으로 이동">←</button><button type="button" data-photo-action="down" data-index="${index}" ${index === place.photos.length - 1 ? 'disabled' : ''} aria-label="사진 뒤로 이동">→</button><button type="button" data-photo-action="remove" data-index="${index}" aria-label="사진 삭제">삭제</button></div></div>`).join('') : '<span class="admin-empty">등록된 사진이 없어요.</span>';
}
function choose(id) {
  selectedId = id;
  const place = selected();
  $('#edit-form').hidden = !place;
  $('#select-hint').hidden = !!place;
  if (!place) { renderList(); return; }
  $('#edit-title').textContent = place.name || '새 맛집';
  for (const field of ['name','address','category','menu','comment']) $(`#edit-${field}`).value = place[field] || '';
  renderList(); renderPhotos(); message('');
}
async function save() {
  const response = await fetch('/api/places', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(places)});
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || '저장하지 못했어요.');
  message('저장 완료! GitHub에 올리면 공유 사이트에도 반영돼요.');
}
function collect() {
  const place = selected();
  for (const field of ['name','address','category','menu','comment']) place[field] = $(`#edit-${field}`).value.trim();
}
async function compress(file) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 12 * 1024 * 1024) throw new Error('JPG·PNG·WebP 사진만 12MB 이하로 올릴 수 있어요.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .82));
  if (!blob || blob.size > 3 * 1024 * 1024) throw new Error('사진 압축에 실패했어요. 다른 사진으로 시도해 주세요.');
  return blob;
}

$('#admin-places').addEventListener('click', (event) => { const button = event.target.closest('[data-id]'); if (button) choose(button.dataset.id); });
$('#add-place').addEventListener('click', () => { const id = crypto.randomUUID(); places.push({id,name:'',address:'',category:'',menu:'',comment:'',photos:[]}); choose(id); $('#edit-name').focus(); });
$('#edit-form').addEventListener('input', () => { if (selected()) { collect(); renderList(); } });
$('#edit-form').addEventListener('submit', async (event) => { event.preventDefault(); collect(); try { await save(); renderList(); $('#edit-title').textContent = selected().name; } catch (error) { message(error.message,true); } });
$('#publish-site').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  if (selected() && !$('#edit-form').reportValidity()) return;
  button.disabled = true;
  try {
    if (selected()) collect();
    await save();
    message('GitHub에 올리는 중...');
    const response = await fetch('/api/publish',{method:'POST'});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'GitHub에 올리지 못했어요.');
    message(result.changed ? '커밋·푸시 완료! 배포가 끝나면 공유 링크에 반영됩니다.' : 'GitHub와 동기화됐어요. 새로 올릴 변경사항은 없습니다.');
  } catch (error) { message(error.message,true); }
  finally { button.disabled = false; }
});
$('#delete-place').addEventListener('click', async () => {
  if (!confirm(`“${selected().name || '새 맛집'}”을 목록에서 삭제할까요?`)) return;
  const before = places; places = places.filter((place) => place.id !== selectedId);
  try { await save(); choose(places[0]?.id || null); message('맛집을 삭제했어요. GitHub에 올리면 공유 사이트에도 반영됩니다.'); } catch (error) { places = before; renderList(); message(error.message,true); }
});
$('#photo-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-photo-action]'); if (!button) return;
  const photos = selected().photos; const index = Number(button.dataset.index); const action = button.dataset.photoAction;
  if (action === 'remove') photos.splice(index,1);
  if (action === 'up' && index > 0) [photos[index-1],photos[index]] = [photos[index],photos[index-1]];
  if (action === 'down' && index < photos.length-1) [photos[index+1],photos[index]] = [photos[index],photos[index+1]];
  renderPhotos(); message('사진 순서를 바꿨으면 저장 버튼을 눌러주세요.');
});
$('#photo-input').addEventListener('change', async (event) => {
  const files = [...event.target.files]; if (!files.length) return;
  try {
    if (!$('#edit-form').reportValidity()) return;
    collect(); message('사진을 압축하고 업로드하는 중...');
    const place = selected();
    for (const file of files) {
      const blob = await compress(file);
      const response = await fetch('/api/photo', {method:'POST',headers:{'Content-Type':'image/webp'},body:blob});
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || '사진 업로드에 실패했어요.');
      place.photos.push((await response.json()).path);
    }
    await save(); renderPhotos(); renderList();
  } catch (error) { message(error.message,true); }
  event.target.value = '';
});

try {
  const response = await fetch('/api/places');
  if (!response.ok) throw new Error('관리 데이터를 읽지 못했어요.');
  places = await response.json(); renderList(); choose(places[0]?.id || null);
} catch (error) { message(error.message,true); }
