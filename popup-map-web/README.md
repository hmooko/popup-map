# Popup Map Web

Popup Map의 Next.js 프론트엔드 MVP입니다.

## 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:3000`입니다.

## 현재 구현

- mock 데이터 기반 팝업 목록/필터/상세 카드
- 지도형 패널과 마커 선택 인터랙션
- 관리자 팝업 등록 폼 정적 화면

백엔드 API가 준비되면 `data/mockPopups.ts` 사용부를 `lib/api.ts` 호출로 교체하면 됩니다.

## API 설정

기본 API 주소는 `https://popup-map-api.with-momo.com`입니다.

```bash
POPUP_MAP_API_BASE_URL=https://popup-map-api.with-momo.com
NEXT_PUBLIC_API_BASE_URL=https://popup-map-api.with-momo.com
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
```

브라우저 CORS 문제를 피하기 위해 클라이언트는 `/api/popups`를 호출하고, Next.js API 라우트가 백엔드의 `/api/v1/popups`로 프록시합니다.

`NEXT_PUBLIC_KAKAO_MAP_APP_KEY`가 있으면 사용자 화면의 지도 영역은 카카오맵 SDK로 렌더링됩니다. 키가 없거나 SDK 로딩에 실패하면 기존 mock 지도 UI가 표시됩니다.
