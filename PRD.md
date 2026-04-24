# 팝업 지도 서비스 PRD

## 1. 제품 개요

### 제품명
Popup Map

### 한 줄 설명
서울 주요 상권의 팝업스토어를 지도 기반으로 탐색하고, 기간/지역/카테고리/예약 여부에 따라 빠르게 찾을 수 있는 서비스.

### 문제 정의
팝업스토어 정보는 인스타그램, 브랜드 공지, 블로그, 커뮤니티에 흩어져 있어 사용자가 현재 갈 수 있는 팝업을 찾기 어렵다. 특히 위치, 운영 기간, 예약 필요 여부, 입장료, 카테고리 같은 방문 판단 정보가 한 화면에 정리되어 있지 않다.

### 목표
- 사용자가 오늘 또는 이번 주말 방문 가능한 팝업스토어를 빠르게 찾는다.
- 지도와 리스트를 함께 제공해 위치 기반 탐색 경험을 만든다.
- 관리자 또는 운영자가 팝업 정보를 쉽게 등록/수정한다.
- Spring Boot 기반 API 서버와 PostgreSQL/PostGIS를 활용해 백엔드 포트폴리오로 설명 가능한 구조를 만든다.

## 2. 타깃 사용자

### 주요 사용자
- 주말에 갈 만한 곳을 찾는 20~30대 사용자
- 성수, 홍대, 강남, 한남 등 팝업스토어 밀집 지역 방문자
- 브랜드 팝업, 캐릭터 팝업, 뷰티/패션 팝업을 좋아하는 사용자

### 관리자
- 팝업 정보를 등록하고 관리하는 운영자
- 잘못된 정보나 종료된 팝업을 수정하는 콘텐츠 관리자

## 3. MVP 범위

### 포함 기능
- 팝업스토어 목록 조회
- 지도 기반 팝업스토어 마커 표시
- 지역/카테고리/운영 상태/예약 필요 여부 필터
- 팝업스토어 상세 페이지
- 관리자 팝업 등록/수정/삭제
- 이미지, 기간, 위치, 외부 링크 관리
- 현재 위치 또는 지정 좌표 기준 근처 팝업 조회

### 제외 기능
- 자동 크롤링
- 결제
- 실시간 혼잡도
- 사용자 리뷰
- 소셜 로그인
- 추천 알고리즘 고도화

## 4. 핵심 사용자 시나리오

### 시나리오 1: 오늘 갈 수 있는 팝업 찾기
1. 사용자가 메인 화면에 접속한다.
2. 지도와 팝업 리스트가 표시된다.
3. `오늘 운영 중` 필터를 선택한다.
4. 사용자는 지역 또는 지도 이동으로 주변 팝업을 확인한다.
5. 팝업 상세에서 운영 시간, 장소, 예약 링크를 확인한다.

### 시나리오 2: 성수 근처 팝업 찾기
1. 사용자가 지역 필터에서 `성수`를 선택한다.
2. 성수 지역의 팝업 마커와 목록이 표시된다.
3. 사용자가 `예약 없이 입장 가능` 필터를 추가한다.
4. 조건에 맞는 팝업만 남는다.

### 시나리오 3: 관리자가 팝업 등록
1. 관리자가 관리자 페이지에 로그인한다.
2. 팝업명, 브랜드명, 주소, 좌표, 기간, 운영 시간, 카테고리, 이미지, 링크를 입력한다.
3. 저장 후 사용자 화면에 즉시 반영된다.

## 5. 기능 요구사항

### 5.1 팝업 목록 조회
- 사용자는 전체 팝업 목록을 조회할 수 있다.
- 기본 정렬은 `현재 운영 중 우선`, 이후 `종료 임박순`이다.
- 종료된 팝업은 기본 목록에서 숨긴다.
- 필터 옵션:
  - 지역: 성수, 홍대, 강남, 한남, 잠실, 여의도
  - 카테고리: 패션, 뷰티, 캐릭터, 푸드, 베이커리, 아트, 라이프스타일, 테크
  - 운영 상태: 오늘 운영 중, 이번 주말 운영, 종료 임박
  - 예약 필요 여부
  - 무료 입장 여부

### 5.2 지도 조회
- 사용자는 지도에서 팝업 위치를 마커로 볼 수 있다.
- 마커 클릭 시 팝업 요약 카드가 표시된다.
- 지도 영역 변경 시 현재 지도 경계 안의 팝업을 다시 조회할 수 있다.
- 현재 위치 권한을 허용하면 내 위치 기준 가까운 팝업을 조회할 수 있다.

### 5.3 팝업 상세
- 상세 화면에는 다음 정보가 표시된다.
  - 팝업명
  - 브랜드명
  - 대표 이미지
  - 카테고리
  - 운영 기간
  - 운영 시간
  - 주소
  - 지도 위치
  - 예약 필요 여부
  - 입장료
  - 공식 링크 또는 예약 링크
  - 소개 문구

### 5.4 관리자 기능
- 관리자는 팝업을 등록할 수 있다.
- 관리자는 등록된 팝업을 수정/삭제할 수 있다.
- 관리자는 팝업 공개 여부를 변경할 수 있다.
- 관리자는 종료된 팝업을 숨김 처리할 수 있다.

### 5.5 근처 팝업 조회
- 클라이언트는 위도, 경도, 반경을 서버에 전달한다.
- 서버는 반경 내 팝업을 거리순으로 반환한다.
- PostgreSQL PostGIS를 사용한다.

## 6. 비기능 요구사항

### 성능
- 팝업 목록 API 응답 시간은 일반 조건에서 500ms 이내를 목표로 한다.
- 지도 경계 조회는 인덱스를 활용해 빠르게 처리한다.

### 보안
- 관리자 API는 인증된 관리자만 접근할 수 있다.
- 사용자 입력값은 서버에서 검증한다.
- 외부 링크는 허용된 URL 형식만 저장한다.

### 운영
- 서버 로그에서 API 오류와 주요 관리자 작업을 추적할 수 있어야 한다.
- 운영 환경과 로컬 환경 설정은 분리한다.

## 7. 기술 스택

### Frontend
- Next.js
- TypeScript
- Kakao Map API 또는 Naver Map API
- Vercel 배포

### Backend
- Spring Boot 3
- Java 21
- Spring Web
- Spring Data JPA
- Spring Security
- Bean Validation
- Flyway

### Database
- PostgreSQL
- PostGIS

### Deployment
- Frontend: Vercel
- Backend: Render, Fly.io, Railway 중 택1
- Database: Supabase Postgres 또는 Neon Postgres

## 8. API 요구사항

### 공개 API

#### 팝업 목록 조회
```http
GET /api/v1/popups
```

Query Parameters:
- `region`: 지역
- `category`: 카테고리
- `status`: 운영 상태
- `reservationRequired`: 예약 필요 여부
- `freeOnly`: 무료 입장 여부
- `startDate`: 조회 시작일
- `endDate`: 조회 종료일
- `page`: 페이지 번호
- `size`: 페이지 크기

#### 팝업 상세 조회
```http
GET /api/v1/popups/{popupId}
```

#### 지도 경계 내 팝업 조회
```http
GET /api/v1/popups/map
```

Query Parameters:
- `southWestLat`
- `southWestLng`
- `northEastLat`
- `northEastLng`

#### 근처 팝업 조회
```http
GET /api/v1/popups/nearby
```

Query Parameters:
- `lat`
- `lng`
- `radiusMeter`

### 관리자 API

#### 팝업 등록
```http
POST /api/v1/admin/popups
```

#### 팝업 수정
```http
PATCH /api/v1/admin/popups/{popupId}
```

#### 팝업 삭제
```http
DELETE /api/v1/admin/popups/{popupId}
```

#### 팝업 공개 상태 변경
```http
PATCH /api/v1/admin/popups/{popupId}/visibility
```

## 9. 데이터 모델 초안

### Popup
- `id`
- `title`
- `brandName`
- `description`
- `category`
- `region`
- `address`
- `latitude`
- `longitude`
- `location`
- `startDate`
- `endDate`
- `openingHours`
- `reservationRequired`
- `freeAdmission`
- `entryFee`
- `officialUrl`
- `reservationUrl`
- `thumbnailUrl`
- `visible`
- `createdAt`
- `updatedAt`

### AdminUser
- `id`
- `email`
- `passwordHash`
- `role`
- `createdAt`
- `updatedAt`

## 10. Spring Boot 서버 구조 초안

```text
com.popupmap
├── PopupMapApplication
├── domain
│   ├── popup
│   │   ├── Popup
│   │   ├── PopupRepository
│   │   ├── PopupService
│   │   ├── PopupController
│   │   ├── AdminPopupController
│   │   └── dto
│   └── admin
│       ├── AdminUser
│       ├── AdminUserRepository
│       └── auth
├── global
│   ├── config
│   ├── error
│   ├── security
│   └── validation
└── infra
    └── geo
```

## 11. 성공 지표

### MVP 기준
- 초기 팝업 데이터 50개 등록
- 지도에서 팝업 마커 정상 표시
- 필터 조합 5개 이상 정상 동작
- 관리자 등록 후 사용자 화면 반영
- 모바일 화면에서 주요 탐색 흐름 사용 가능

### 배포 후 지표
- 방문자 수
- 팝업 상세 클릭률
- 외부 링크 클릭률
- 지역/카테고리별 필터 사용률
- 관리자 등록 소요 시간

## 12. 1차 개발 마일스톤

### 1단계: 백엔드 기반
- Spring Boot 프로젝트 생성
- PostgreSQL/PostGIS 연결
- Flyway 마이그레이션 구성
- Popup 엔티티 및 목록/상세 API 구현

### 2단계: 지도 API
- 지도 경계 조회 구현
- 근처 팝업 조회 구현
- 위치 인덱스 적용

### 3단계: 관리자
- 관리자 인증 구현
- 팝업 등록/수정/삭제 API 구현
- 입력값 검증 및 에러 응답 정리

### 4단계: 프론트엔드
- 지도 화면 구현
- 리스트/상세 화면 구현
- 필터 UI 구현
- 관리자 등록 화면 구현

### 5단계: 배포
- 백엔드 배포
- DB 배포
- 프론트 배포
- 운영 환경 변수 정리

## 13. 리스크와 대응

### 팝업 데이터 수집 비용
- 초기에는 수동 등록으로 시작한다.
- 운영자가 쉽게 등록할 수 있는 관리자 화면을 우선 만든다.

### 지도 API 비용 또는 제한
- MVP에서는 무료 할당량이 충분한 지도 API를 사용한다.
- 호출량 증가 시 지도 경계 조회와 캐싱 전략을 검토한다.

### 위치 검색 정확도
- 주소 기반 검색만으로는 한계가 있으므로 좌표를 직접 저장한다.
- 추후 주소를 좌표로 변환하는 geocoding 기능을 붙인다.

## 14. 후속 확장 아이디어

- 사용자 북마크
- 팝업 방문 코스 생성
- 이번 주말 추천 팝업
- 인스타그램 링크 기반 반자동 등록
- 사용자 제보 기능
- 종료 임박 알림
- 팝업별 혼잡도 제보
