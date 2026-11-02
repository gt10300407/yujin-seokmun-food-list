# 유진 석문의 맛집 리스트 to 소연누나

직접 고른 안산 맛집을 사진, 추천 메뉴, 한줄평과 함께 보여주는 정적 사이트입니다. HTML·CSS·JavaScript만 사용합니다. 지도 API 키와 데이터베이스는 사용하지 않습니다.

## 실행과 관리

```bash
npm start
```

- 공개 화면 미리보기: `http://localhost:4173`
- 이 Mac의 관리 화면: `http://localhost:4173/admin`

관리 화면에서 식당 이름·주소·종류·추천 메뉴·한줄평을 고치고 사진을 올립니다. 저장 즉시 로컬 미리보기에 반영됩니다. JPG·PNG·WebP 사진은 브라우저에서 WebP로 압축해 `photos/`에 저장합니다. 첫 번째 사진이 대표 사진입니다. 상세 화면에서는 사진을 한 장씩 넘길 수 있습니다. 사진 순서는 화살표로 바꾸고 저장합니다. 삭제한 사진 파일은 저장할 때 제거됩니다.

## 누나에게 공유하기

공유 링크: [유진 석문의 맛집 리스트](https://gt10300407.github.io/yujin-seokmun-food-list/)

`npm run build`는 `dist/`에 공개 파일만 만듭니다. GitHub Pages 워크플로는 `main` 브랜치에 올린 뒤 이 폴더를 배포합니다. `local/` 관리자 화면과 서버 코드는 배포 대상에서 제외됩니다.

```bash
npm test
npm run build
git add data/places.json photos
git commit -m "Update food list"
git push
```

`git push` 후 배포가 끝나면 공유 링크가 바뀝니다. GitHub Pages는 공개 웹사이트이므로 식당 정보와 사진은 누구나 볼 수 있습니다. 이전에 알려준 출발지 주소는 이 사이트에 넣지 않았습니다.

각 식당 카드의 **카카오맵 열기** 링크와 상세 화면의 지도 링크는 카카오 공식 검색 URL을 엽니다. 모바일에서는 모바일웹 지도로 연결됩니다. 앱 전환 모습은 휴대폰에서 확인해야 합니다.

## 데이터

- `data/places.json`: 식당 정보, 사진 파일 경로
- `photos/`: 관리 화면에서 올린 사진
- `local/`: 로컬 전용 관리 화면과 파일 저장 서버
- `02_Functional_Spec.md`: 현재 기능명세
- `04_Wireframe.html`: 현재 화면 구성
- `03_Work_Report.html`: 작업 및 검증 결과

사용자가 사용을 승인한 사진 패키지에서 20장을 받아 7곳에 연결했습니다. 깡통 삼겹살과 사랑담은 묵은지찌개에는 사진 URL이 없고, 만두 대박 분식 후보는 다른 주소의 가게 사진이라 연결하지 않았습니다. 추천 메뉴·한줄평은 아직 입력되지 않았습니다. 세 곳의 이름과 주소는 현재 카카오 검색 결과와 다를 수 있지만, 제공한 이름·주소를 그대로 사용하라는 요청을 따랐습니다.

## 참고

- [카카오 지도 URL 공식 가이드](https://apis.map.kakao.com/web/guide/#mapurl)
- [GitHub Pages 작업 흐름](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
