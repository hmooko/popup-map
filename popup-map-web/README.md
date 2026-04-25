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
