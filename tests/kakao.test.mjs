import assert from "node:assert/strict";
import test from "node:test";
import { fitLocations } from "../lib/kakao.ts";

test("빈 지도는 안산 중심, 여러 위치는 지도 범위로 맞춘다", () => {
  const calls = [];
  const api = {
    LatLng: class { constructor(lat, lng) { this.lat = lat; this.lng = lng; } },
    LatLngBounds: class { points = []; extend(point) { this.points.push(point); } },
  };
  const map = {
    setCenter: (point) => calls.push(["center", { lat: point.lat, lng: point.lng }]),
    setLevel: (level) => calls.push(["level", level]),
    setBounds: (bounds, ...padding) => calls.push(["bounds", bounds.points.map((point) => ({ lat: point.lat, lng: point.lng })), padding]),
  };
  fitLocations(api, map, []);
  assert.deepEqual(calls[0], ["center", { lat: 37.323611, lng: 126.821944 }]);
  assert.deepEqual(calls[1], ["level", 8]);
  fitLocations(api, map, [{ lat: 37.3, lng: 126.8 }, { lat: 37.4, lng: 126.9 }]);
  assert.deepEqual(calls[2], ["bounds", [{ lat: 37.3, lng: 126.8 }, { lat: 37.4, lng: 126.9 }], [48, 48, 150, 48]]);
});
