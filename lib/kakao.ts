import type { Coordinates } from "@/data/places";

type LatLng = object;
type Bounds = { extend(point: LatLng): void };
export type KakaoMap = {
  setBounds(bounds: Bounds, top?: number, right?: number, bottom?: number, left?: number): void;
  setCenter(point: LatLng): void;
  setLevel(level: number): void;
};
export type KakaoOverlay = { setMap(map: KakaoMap | null): void };
export type KakaoMaps = {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => Bounds;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number }) => KakaoMap;
  CustomOverlay: new (options: { position: LatLng; map: KakaoMap; content: HTMLElement; clickable: boolean; xAnchor: number; yAnchor: number }) => KakaoOverlay;
};

declare global {
  interface Window { kakao?: { maps: KakaoMaps } }
}

let loading: Promise<KakaoMaps> | null = null;

export function loadKakao(appKey: string): Promise<KakaoMaps> {
  if (window.kakao?.maps) return new Promise((resolve) => window.kakao!.maps.load(() => resolve(window.kakao!.maps)));
  if (loading) return loading;
  loading = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao?.maps ? window.kakao.maps.load(() => resolve(window.kakao!.maps)) : reject(new Error("카카오 지도 SDK를 찾을 수 없습니다."));
    script.onerror = () => reject(new Error("카카오 지도를 불러오지 못했습니다."));
    document.head.append(script);
  }).catch((error) => {
    loading = null;
    throw error;
  });
  return loading;
}

export function point(api: KakaoMaps, location: Coordinates): LatLng {
  return new api.LatLng(location.lat, location.lng);
}

export function fitLocations(api: KakaoMaps, map: KakaoMap, locations: Coordinates[]) {
  if (!locations.length) {
    map.setCenter(point(api, { lat: 37.323611, lng: 126.821944 }));
    map.setLevel(8);
    return;
  }
  if (locations.length === 1) {
    map.setCenter(point(api, locations[0]));
    map.setLevel(4);
    return;
  }
  const bounds = new api.LatLngBounds();
  locations.forEach((location) => bounds.extend(point(api, location)));
  map.setBounds(bounds, 48, 48, 150, 48);
}

export function markerElement(kind: "origin" | "restaurant" | "selected", name: string, onClick?: () => void): HTMLElement {
  const element = document.createElement(kind === "origin" ? "span" : "button");
  element.className = `map-pin map-pin-${kind}`;
  element.textContent = kind === "origin" ? "출발" : kind === "selected" ? "선택" : "맛집";
  element.setAttribute("aria-label", name);
  if (element instanceof HTMLButtonElement) {
    element.type = "button";
    element.addEventListener("click", () => onClick?.());
  }
  return element;
}
