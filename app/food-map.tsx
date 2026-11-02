"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { origin, restaurants, type Restaurant } from "@/data/places";
import { fitLocations, loadKakao, markerElement, point, type KakaoMap, type KakaoOverlay } from "@/lib/kakao";

const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

export default function FoodMap() {
  const [category, setCategory] = useState("전체");
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [mapStatus, setMapStatus] = useState<"missing-key" | "loading" | "ready" | "error">(key ? "loading" : "missing-key");
  const [retry, setRetry] = useState(0);
  const mapRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoOverlay[]>([]);
  const categories = useMemo(() => ["전체", ...new Set(restaurants.map((place) => place.category))], []);
  const visible = useMemo(() => category === "전체" ? restaurants : restaurants.filter((place) => place.category === category), [category]);

  useEffect(() => {
    if (!key) return;
    let active = true;
    loadKakao(key).then((api) => {
      if (!active) return;
      const container = document.getElementById("ansan-map");
      if (!container) throw new Error("지도 영역을 찾을 수 없습니다.");
      mapRef.current = new api.Map(container, {
        center: point(api, { lat: 37.323611, lng: 126.821944 }),
        level: 8,
      });
      setMapStatus("ready");
    }).catch(() => active && setMapStatus("error"));
    return () => {
      active = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
      document.getElementById("ansan-map")?.replaceChildren();
    };
  }, [retry]);

  useEffect(() => {
    const map = mapRef.current;
    const api = window.kakao?.maps;
    if (!map || !api || mapStatus !== "ready") return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    if (origin?.showOnMap) {
      markersRef.current.push(new api.CustomOverlay({
        position: point(api, origin.location), map,
        content: markerElement("origin", origin.name), clickable: true, xAnchor: 0.5, yAnchor: 1,
      }));
    }
    visible.forEach((place) => {
      const marker = new api.CustomOverlay({
        position: point(api, place.location), map,
        content: markerElement(selected?.id === place.id ? "selected" : "restaurant", place.name, () => select(place)),
        clickable: true, xAnchor: 0.5, yAnchor: 1,
      });
      markersRef.current.push(marker);
    });
  }, [mapStatus, selected, visible]);

  function select(place: Restaurant) {
    setSelected(place);
    setListOpen(false);
    const api = window.kakao?.maps;
    if (api && mapRef.current) mapRef.current.setCenter(point(api, place.location));
  }

  function showAll() {
    const api = window.kakao?.maps;
    if (!api || !mapRef.current) return;
    fitLocations(api, mapRef.current, [...(origin ? [origin.location] : []), ...visible.map((place) => place.location)]);
    setSelected(null);
  }

  function changeCategory(value: string) {
    setCategory(value);
    if (selected && value !== "전체" && selected.category !== value) setSelected(null);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">안산에서 함께 걷는 맛집 지도</p>
          <h1>BROCK ANSAN FOOD MAP</h1>
          <p>직접 다녀온 곳만 소개할게요.</p>
        </div>
        <button type="button" className="header-button" onClick={() => setListOpen(true)}>목록 <span>{visible.length}</span></button>
      </header>

      <nav className="filters" aria-label="음식 카테고리">
        {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => changeCategory(item)}>{item}</button>)}
      </nav>

      <section className="map-area" aria-label="안산시 맛집 지도">
        <div id="ansan-map" className="map-canvas" aria-hidden={mapStatus !== "ready"} />
        {mapStatus === "ready" && <button type="button" className="map-all" onClick={showAll}>전체 보기</button>}
        {mapStatus !== "ready" && <div className="map-message" role="status">
          <span className="map-message-icon" aria-hidden="true">⌖</span>
          <h2>{mapStatus === "loading" ? "안산 지도를 불러오는 중" : mapStatus === "missing-key" ? "지도 연결이 필요해요" : "지도를 불러오지 못했어요"}</h2>
          <p>{mapStatus === "missing-key" ? "카카오 지도 키를 설정하면 실제 안산 지도가 표시됩니다." : mapStatus === "error" ? "네트워크나 카카오 지도 설정을 확인해 주세요." : "잠시만 기다려 주세요."}</p>
          {mapStatus === "error" && <button type="button" onClick={() => { setMapStatus("loading"); setRetry((value) => value + 1); }}>다시 시도</button>}
        </div>}
        {mapStatus === "ready" && visible.length === 0 && <div className="map-empty">{category === "전체" ? "아직 등록된 맛집이 없어요." : "이 카테고리의 맛집이 없어요."}</div>}
      </section>

      {selected && <section className="selection-card" aria-label="선택한 맛집">
        <div><span>{selected.category}</span><h2>{selected.name}</h2><p>{selected.roadAddress}</p></div>
        <button type="button" onClick={() => setSelected(null)} aria-label="선택 해제">×</button>
      </section>}

      <footer className="bottom-bar"><span>맛집 {visible.length}곳</span><span>안산시</span></footer>

      {listOpen && <div className="list-backdrop" onClick={() => setListOpen(false)}>
        <section className="list-sheet" role="dialog" aria-modal="true" aria-label="맛집 목록" onClick={(event) => event.stopPropagation()}>
          <div className="sheet-head"><h2>맛집 {visible.length}곳</h2><button type="button" onClick={() => setListOpen(false)} aria-label="맛집 목록 닫기">×</button></div>
          {visible.length ? <ul>{visible.map((place) => <li key={place.id}><button type="button" onClick={() => select(place)}><strong>{place.name}</strong><span>{place.category} · {place.roadAddress}</span></button></li>)}</ul> : <p className="list-empty">등록된 맛집이 없어요.</p>}
        </section>
      </div>}
    </main>
  );
}
