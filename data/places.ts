export type Coordinates = { lat: number; lng: number };

export type Restaurant = {
  id: string;
  name: string;
  roadAddress: string;
  category: string;
  location: Coordinates;
  recommendedMenu?: string;
  review?: string;
  photos: { src: string; alt: string; type: "exterior" | "food" }[];
};

// GitHub Pages에 공개됩니다. 실제 자택 대신 인근 공공장소를 입력하세요.
export const origin: { name: string; location: Coordinates; showOnMap: boolean } | null = null;

// 직접 방문하고 위치·사진 사용 권한을 확인한 식당만 추가하세요.
export const restaurants: Restaurant[] = [];
