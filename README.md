# 유진 석문의 맛집 리스트 to 소연누나

직접 고른 안산 맛집을 사진, 추천 메뉴, 한줄평과 함께 보여주는 정적 사이트입니다. HTML·CSS·JavaScript만 사용합니다. 지도 API 키와 데이터베이스는 사용하지 않습니다.

## 실행과 관리

```bash
npm start
```

- 공개 화면 미리보기: `http://localhost:4173`
- 이 Mac의 관리 화면: `http://localhost:4173/admin`

관리 화면에서 **+ 맛집 추가**를 누르고 이름·주소·음식 종류·추천 메뉴·한줄평을 입력합니다. 음식 종류는 기존 항목을 고르거나 새 이름을 쓸 수 있습니다. 사진을 올리고 **변경사항 저장**을 누르면 로컬 미리보기에 바로 반영됩니다. **저장하고 커밋·푸시**를 누르면 식당 데이터와 사진만 GitHub에 올리고, 배포가 끝난 뒤 공유 링크에도 반영됩니다. 관리 화면은 이 Mac의 로컬 서버에서만 열리며 공개 사이트에는 포함되지 않습니다.

JPG·PNG·WebP 사진은 브라우저에서 WebP로 압축해 `photos/`에 저장합니다. 첫 번째 사진이 대표 사진입니다. 상세 화면에서는 사진을 한 장씩 넘길 수 있습니다. 사진 순서는 화살표로 바꾸고 저장합니다. 삭제한 사진 파일은 저장할 때 제거됩니다.

## 누나에게 공유하기

공유 링크: [유진 석문의 맛집 리스트](https://gt10300407.github.io/yujin-seokmun-food-list/)

`npm run build`는 `dist/`에 공개 파일만 만듭니다. GitHub Pages 워크플로는 `main` 브랜치에 올린 뒤 이 폴더를 배포합니다. `local/` 관리자 화면과 서버 코드는 배포 대상에서 제외됩니다.

```bash
npm test
npm run build
git add -A -- data/places.json photos
git commit -m "Update food list"
git push
```

관리 화면의 **저장하고 커밋·푸시** 버튼을 쓰면 위 Git 명령을 직접 입력하지 않아도 됩니다. 다른 코드의 미공개 커밋이 있으면 버튼이 중단되고 안내를 표시합니다. 배포가 끝나면 공유 링크가 바뀝니다. GitHub Pages는 공개 웹사이트이므로 식당 정보와 사진은 누구나 볼 수 있습니다. 이전에 알려준 출발지 주소는 이 사이트에 넣지 않았습니다.

각 식당 카드의 **카카오맵 열기** 링크와 상세 화면의 지도 링크는 카카오 공식 검색 URL을 엽니다. 모바일에서는 모바일웹 지도로 연결됩니다. 앱 전환 모습은 휴대폰에서 확인해야 합니다.

## 데이터

- `data/places.json`: 식당 정보, 사진 파일 경로
- `photos/`: 관리 화면에서 올린 사진
- `local/`: 로컬 전용 관리 화면과 파일 저장 서버
- `02_Functional_Spec.md`: 현재 기능명세
- `04_Wireframe.html`: 현재 화면 구성
- `03_Work_Report.html`: 작업 및 검증 결과

사용자가 승인한 사진 패키지 21장과 대화에 첨부한 사진 8장을 합쳐 10곳에 29장을 연결했습니다. 만두 대박 분식에는 이번에 첨부한 메뉴판 사진 2장만 사용했습니다. 맛집별 한줄평 10개를 카드와 상세에 표시합니다. 추천 메뉴 입력란은 아직 비어 있습니다. 일부 식당의 이름·주소는 카카오 검색 결과와 다를 수 있어, 사용자가 정한 표기를 기준으로 표시했습니다.

## 참고

- [카카오 지도 URL 공식 가이드](https://apis.map.kakao.com/web/guide/#mapurl)
- [GitHub Pages 작업 흐름](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
