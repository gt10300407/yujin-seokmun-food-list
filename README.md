# BROCK ANSAN FOOD MAP

직접 방문한 안산 맛집을 지도에서 소개하는 모바일 사이트입니다. 여섯 단계로 개발하며, 현재는 **1단계 기본 화면 완료 / 2단계 카카오 지도 코드 구현, 실키 검증 전**입니다. 실제 식당과 출발지 데이터는 아직 없으므로 빈 화면이 정상입니다.

## 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

카카오디벨로퍼스에서 앱을 만들고 **카카오맵 사용 설정을 ON**으로 바꾼 뒤 JavaScript 키의 **JavaScript SDK 도메인**에 `http://localhost:3000`과 배포 도메인 `https://<GitHub 사용자명>.github.io`를 등록하세요. 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_JS_KEY`에 넣고 개발 서버를 다시 시작합니다. 지도 JavaScript 키는 브라우저에 노출되므로 카카오에서 도메인을 제한합니다. 지도 앱의 무료 쿼터는 개발자 계정에서 첫 번째로 카카오맵을 활성화한 앱에만 적용됩니다.

## 데이터 수정

`data/places.ts`의 `origin`과 `restaurants`를 수정하고, 직접 촬영하거나 사용을 허락받은 사진을 `public/photos/`에 넣습니다. 실제 자택 대신 가까운 공공장소를 출발지로 등록하세요. GitHub Pages에 게시한 사이트와 데이터는 링크를 모르는 사람도 접근할 수 있습니다.

## 실제 도보 경로

카카오맵의 도보 경로 REST API는 실제 경로 좌표와 거리·시간을 제공합니다. **REST API 키는 GitHub Pages의 소스나 `NEXT_PUBLIC_` 환경변수에 넣으면 안 됩니다.** 별도 중계 함수에서 키를 보관해야 합니다. 현재 중계 함수와 경로 애니메이션은 미구현이며, 지도와 식당 위치를 실키로 검증한 다음 단계에서 진행합니다. 실제 값이 없는 동안 거리·시간이나 직선 경로를 만들어 표시하지 않습니다.

## 검사

```bash
npm run check
npm test
npm run build
```

기능명세는 `02_Functional_Spec.md`, 와이어프레임은 `04_Wireframe.html`, 작업 결과는 `03_Work_Report.html`에 있습니다.

## 공식 문서

- [카카오 지도 Web 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오맵 도보 경로 REST API](https://developers.kakao.com/docs/ko/kakaomap/rest-api)
- [카카오맵 무료 쿼터 정책](https://developers.kakao.com/docs/ko/kakaomap/common)
- [GitHub Pages 소개](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
