const $ = (selector) => document.querySelector(selector);
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let places = [];
let category = '전체';

function photoPath(name) {
  return /^photos\/[a-z0-9-]+\.webp$/.test(name) ? `./${name}` : '';
}

function kakaoUrl(place) {
  return `https://map.kakao.com/link/search/${encodeURIComponent(place.address)}`;
}

function render() {
  const categories = ['전체', ...new Set(places.map((place) => place.category))];
  $('#filters').innerHTML = categories.map((item) => `<button type="button" data-category="${escape(item)}" aria-pressed="${category === item}">${escape(item)}</button>`).join('');
  const shown = category === '전체' ? places : places.filter((place) => place.category === category);
  $('#hero-count').textContent = places.length;
  $('#section-count').textContent = `${shown.length}곳`;
  $('#places').innerHTML = shown.length ? shown.map((place) => {
    const number = places.indexOf(place) + 1;
    const photo = photoPath(place.photos?.[0]);
    return `<article class="place-card"><div class="card-image">${photo ? `<img loading="lazy" src="${photo}" alt="${escape(place.name)} 사진">` : '<div class="no-photo"><span class="photo-icon" aria-hidden="true"></span>사진 없음</div>'}<span class="card-no">${String(number).padStart(2,'0')}</span></div><div class="card-body"><span class="card-category">${escape(place.category)}</span><h3>${escape(place.name)}</h3><p class="card-address">${escape(place.address)}</p>${place.comment ? `<p class="card-comment">“${escape(place.comment)}”</p>` : ''}<div class="card-footer"><span class="card-menu">${place.menu ? `추천 메뉴 · ${escape(place.menu)}` : ''}</span><a class="card-open" href="${kakaoUrl(place)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(place.name)} 카카오맵 열기"><span>카카오맵 열기</span><span class="card-open-arrow" aria-hidden="true">↗</span></a></div></div><button class="card-detail" type="button" data-id="${escape(place.id)}" aria-label="${escape(place.name)} 자세히 보기"></button></article>`;
  }).join('') : '<div class="empty-filter">이 종류의 맛집은 아직 없어요.</div>';
}

function openDetail(id) {
  const place = places.find((item) => item.id === id);
  if (!place) return;
  const photo = photoPath(place.photos?.[0]);
  const gallery = (place.photos || []).map((name) => photoPath(name)).filter(Boolean);
  $('#detail-content').innerHTML = `<div class="detail-image">${photo ? `<img src="${photo}" alt="${escape(place.name)} 대표 사진">` : '사진 없음'}</div><div class="detail-inner"><p class="small-label">${escape(place.category)}</p><h2 id="detail-name">${escape(place.name)}</h2><address>${escape(place.address)}</address>${gallery.length ? `<div class="detail-photos" id="detail-photos">${gallery.map((src, index) => `<button type="button" data-photo="${src}" aria-label="사진 ${index + 1} 크게 보기"><img loading="lazy" src="${src}" alt="${escape(place.name)} 사진 ${index + 1}"></button>`).join('')}</div>${gallery.length > 1 ? `<div class="photo-nav"><button type="button" data-slide="-1" aria-label="이전 사진" disabled>‹</button><span id="photo-count" aria-live="polite">1 / ${gallery.length}</span><button type="button" data-slide="1" aria-label="다음 사진">›</button></div>` : ''}` : ''}<div class="divider"></div>${place.menu ? `<div class="detail-row"><small>추천 메뉴</small><p>${escape(place.menu)}</p></div>` : ''}${place.comment ? `<div class="detail-row"><small>한줄평</small><p class="detail-quote">“${escape(place.comment)}”</p></div>` : ''}<div class="detail-actions"><a href="${kakaoUrl(place)}" target="_blank" rel="noopener noreferrer">카카오맵에서 주소 보기 ↗</a></div></div>`;
  $('#detail').showModal();
  if (gallery.length > 1) $('#detail-photos').addEventListener('scroll', (event) => {
    const index = Math.round(event.target.scrollLeft / event.target.clientWidth);
    $('#photo-count').textContent = `${index + 1} / ${gallery.length}`;
    $('#detail [data-slide="-1"]').disabled = index === 0;
    $('#detail [data-slide="1"]').disabled = index === gallery.length - 1;
  });
}

$('#filters').addEventListener('click', (event) => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  category = button.dataset.category;
  render();
});
$('#places').addEventListener('click', (event) => {
  const button = event.target.closest('[data-id]');
  if (button) openDetail(button.dataset.id);
});
$('#detail').addEventListener('click', (event) => {
  const button = event.target.closest('[data-photo]');
  if (button) {
    $('#photo-full').src = button.dataset.photo;
    $('#photo-full').alt = '맛집 사진 크게 보기';
    $('#photo-viewer').showModal();
  } else if (event.target.closest('[data-slide]')) {
    $('#detail-photos').scrollBy({left: Number(event.target.closest('[data-slide]').dataset.slide) * $('#detail-photos').clientWidth, behavior: 'smooth'});
  } else if (event.target === $('#detail')) $('#detail').close();
});
$('#detail-close').addEventListener('click', () => $('#detail').close());
$('#photo-close').addEventListener('click', () => $('#photo-viewer').close());
$('#photo-viewer').addEventListener('click', (event) => { if (event.target === $('#photo-viewer')) $('#photo-viewer').close(); });

try {
  const response = await fetch('./data/places.json', {cache:'no-cache'});
  if (!response.ok) throw new Error('맛집 데이터를 읽지 못했습니다.');
  places = await response.json();
  if (!Array.isArray(places)) throw new Error('맛집 데이터 형식이 올바르지 않습니다.');
  $('#status').textContent = '';
  render();
} catch (error) {
  $('#status').textContent = `${error.message} 페이지를 새로고침해 주세요.`;
}
